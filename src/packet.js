export const Types = {
	SERVERDATA_AUTH: 3,
	SERVERDATA_AUTH_RESPONSE: 2,
	SERVERDATA_EXECCOMMAND: 2,
	SERVERDATA_RESPONSE_VALUE: 0,
}

export const encode = ({ id, type, body }) => {
	const bodyBytes = Buffer.from(body, 'utf8')
	const size = bodyBytes.length + 10
	const buf = Buffer.alloc(size + 4)

	buf.writeInt32LE(size, 0)
	buf.writeInt32LE(id, 4)
	buf.writeInt32LE(type, 8)
	bodyBytes.copy(buf, 12)

	return buf
}

export const peekSize = (buf, offset) =>
	buf.length - offset < 4 ? null : buf.readInt32LE(offset) + 4

export const decode = (buf) => {
	const size = buf.readInt32LE(0)
	const id = buf.readInt32LE(4)
	const type = buf.readInt32LE(8)
	const body = buf.toString('utf8', 12, size - 10)

	return { id, type, body }
}
