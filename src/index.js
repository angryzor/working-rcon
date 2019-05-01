import { createConnection } from 'net'
import { timeout, TimeoutError as PromiseTimeoutError } from 'promise-timeout'
import { Types, encode, decode, peekSize } from './packet'

export class RconError extends Error {
	constructor(message) {
		super(message)

		this.name = this.constructor.name
	}
}

export class UnexpectedPacketError extends RconError {
	constructor(packet, expectedType) {
		super(`Got unexpected packet ${JSON.stringify(packet)}. Expected ${expectedType}.`)

		this._packet = packet
		this._expectedType = expectedType
	}
}

export class AuthenticationError extends RconError {
	constructor() {
		super('Authentication failed!')
	}
}

export class TimeoutError extends RconError {
	constructor() {
		super('Request timed out.')
	}
}

const newPacket = (size) => ({ size, buffer: Buffer.alloc(size), offset: 0 })

class RconClient {
	constructor(socket, timeout) {
		this._callbacks = new Map()
		this._socket = socket
		this._timeout = timeout
		this._currentId = 0
		this._pendingPacket = null
		this._socket.on('data', this._onReceiveData)
	}

	async authenticate(password) {
		const id = this._uniqueId

		this._write({ id, type: Types.SERVERDATA_AUTH, body: password })

		await Promise.race([this._receive(id), this._receive(-1)])

		// We cannot provide the rest of the implementation of the protocol
		// according to Valve's Wiki page, since some servers do not respond
		// with authentication results at all (e.g. CS:GO: it just accepts faulty
		// passwords but doesn't execute the commands sent).

		// Taking the pragmatic approach, we instead opt to require passwords to be correct.
		// The code below implements the rest of the protocol as described in the wiki page.

		// if (reply.type === Types.SERVERDATA_RESPONSE_VALUE) {
		// 	reply = await Promise.race([this._receive(id), this._receive(-1)])
		// }

		// if (reply.type !== Types.SERVERDATA_AUTH_RESPONSE) {
		// 	throw new UnexpectedPacketError(packet, 'SERVERDATA_AUTH_RESPONSE')
		// }

		// if (reply.id === -1) {
		// 	throw new AuthenticationError()
		// }
	}

	async command(cmd) {
		const result = await this._query({ type: Types.SERVERDATA_EXECCOMMAND, body: cmd })

		if (result.type !== Types.SERVERDATA_RESPONSE_VALUE) {
			throw new UnexpectedPacketError(packet, 'SERVERDATA_RESPONSE_VALUE')
		}

		return result.body
	}

	disconnect() {
		return new Promise(resolve => {
			this._socket.end(null, null, resolve)
		})
	}

	_query(packet) {
		const id = this._uniqueId

		this._write({ id, ...packet })
		return this._receive(id)
	}

	_write(packet) {
		this._socket.write(encode(packet))
	}

	async _receive(conversationId) {
		try {
			return await timeout(new Promise(resolve => {
				this._callbacks.set(conversationId, resolve)
			}), this._timeout)
		} catch (err) {
			if (err instanceof PromiseTimeoutError) {
				this._callbacks.delete(conversationId)
				throw new TimeoutError()
			} else {
				throw err
			}
		}
	}

	_onReceivePacket(buf) {
		const packet = decode(buf)
		const callback = this._callbacks.get(packet.id)

		// If the callback doesn't exist it may be a query that timed out, ignore.
		if (callback != null) {
			this._callbacks.delete(packet.id)
			callback(packet)
		}
	}

	_onReceiveData = data => {
		let currentOffset = 0

		while (currentOffset < data.length) {
			const packet = this._pendingPacket != null ? this._pendingPacket : newPacket(peekSize(data, currentOffset))
			const copyUntil = Math.min(currentOffset + packet.size, data.length)

			data.copy(packet.buffer, packet.offset, currentOffset, copyUntil)

			if (currentOffset + packet.size > data.length) {
				this._pendingPacket = { ...packet, offset: packet.offset + copyUntil - currentOffset }
			} else {
				this._pendingPacket = null
				this._onReceivePacket(packet.buffer)
			}

			currentOffset = copyUntil
		}
	}

	_onSocketError = err => {
		throw err
	}

	get _uniqueId() {
		return this._currentId++
	}
}

exports.connect = (host, port, password, timeout = 1000) =>
	new Promise((resolve, reject) => {
		const socket = createConnection({ host, port }, async () => {
			try {
				const client = new RconClient(socket, timeout)

				await client.authenticate(password)

				resolve(client)
			} catch (err) {
				socket.destroy()
				reject(err)
			}
		})

		socket.once('error', reject)
	})
