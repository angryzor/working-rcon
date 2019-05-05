import EventEmitter from 'events'
import { __RewireAPI__ as __index } from '../../src/index'

describe('RconClient', () => {
	describe('constructor', () => {
		test.todo('should listen to data events')
	})

	describe('socket data event', () => {
		test('should correctly packetize single packet data buffers', () => {
			const pkt = {}
			const buffer = Buffer.from([
				0x0a, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
			])

			const decode = jest.fn().mockReturnValue(pkt)
			__index.__Rewire__('decode', decode)

			const socket = new EventEmitter()
			const RconClient = __index.__GetDependency__('RconClient')
			const rconClient = new RconClient(socket, 5000)

			socket.emit('data', buffer)

			expect(decode).toHaveBeenCalledTimes(1)
			expect(decode).toHaveBeenCalledWith(buffer)
		})

		test('should correctly packetize multi packet data buffers', () => {
			const pkt = {}
			const data1 = [
				0x0a, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
			]
			const data2 = [
				0x04, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04,
			]
			const data3 = [
				0x06, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
			]

			const decode = jest.fn().mockReturnValue(pkt)
			__index.__Rewire__('decode', decode)

			const socket = new EventEmitter()
			const RconClient = __index.__GetDependency__('RconClient')
			const rconClient = new RconClient(socket, 5000)

			socket.emit('data', Buffer.from([...data1, ...data2, ...data3]))

			expect(decode).toHaveBeenNthCalledWith(1, Buffer.from(data1))
			expect(decode).toHaveBeenNthCalledWith(2, Buffer.from(data2))
			expect(decode).toHaveBeenNthCalledWith(3, Buffer.from(data3))
			expect(decode).toHaveBeenCalledTimes(3)
		})

		test('should correctly packetize split data packets', () => {
			const pkt = {}
			const data1 = [
				0x0a, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
			]
			const data2a = [
				0x04, 0x00, 0x00, 0x00,
				0x01,
			]
			const data2b = [
				0x02, 0x03, 0x04,
			]
			const data3 = [
				0x06, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
			]

			const decode = jest.fn().mockReturnValue(pkt)
			__index.__Rewire__('decode', decode)

			const socket = new EventEmitter()
			const RconClient = __index.__GetDependency__('RconClient')
			const rconClient = new RconClient(socket, 5000)

			socket.emit('data', Buffer.from([...data1, ...data2a]))
			socket.emit('data', Buffer.from([...data2b, ...data3]))

			expect(decode).toHaveBeenNthCalledWith(1, Buffer.from(data1))
			expect(decode).toHaveBeenNthCalledWith(2, Buffer.from([...data2a, ...data2b]))
			expect(decode).toHaveBeenNthCalledWith(3, Buffer.from(data3))
			expect(decode).toHaveBeenCalledTimes(3)
		})

		test('should correctly packetize packets split over multiple buffers', () => {
			const pkt = {}
			const data1 = [
				0x0a, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
			]
			const data2a = [
				0x0c, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03,
			]
			const data2b = [
				0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
			]
			const data2c = [
				0x0a, 0x0b, 0x0c,
			]
			const data3 = [
				0x06, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
			]

			const decode = jest.fn().mockReturnValue(pkt)
			__index.__Rewire__('decode', decode)

			const socket = new EventEmitter()
			const RconClient = __index.__GetDependency__('RconClient')
			const rconClient = new RconClient(socket, 5000)

			socket.emit('data', Buffer.from([...data1, ...data2a]))
			socket.emit('data', Buffer.from(data2b))
			socket.emit('data', Buffer.from([...data2c, ...data3]))

			expect(decode).toHaveBeenNthCalledWith(1, Buffer.from(data1))
			expect(decode).toHaveBeenNthCalledWith(2, Buffer.from([...data2a, ...data2b, ...data2c]))
			expect(decode).toHaveBeenNthCalledWith(3, Buffer.from(data3))
			expect(decode).toHaveBeenCalledTimes(3)
		})

		test('should correctly packetize data that is split at the packet size value', () => {
			const pkt = {}
			const data1 = [
				0x0a, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
			]
			const data2a = [
				0x04, 0x00,
			]
			const data2b = [
				0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
			]
			const data3 = [
				0x06, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
			]

			const decode = jest.fn().mockReturnValue(pkt)
			__index.__Rewire__('decode', decode)

			const socket = new EventEmitter()
			const RconClient = __index.__GetDependency__('RconClient')
			const rconClient = new RconClient(socket, 5000)

			socket.emit('data', Buffer.from([...data1, ...data2a]))
			socket.emit('data', Buffer.from([...data2b, ...data3]))

			expect(decode).toHaveBeenNthCalledWith(1, Buffer.from(data1))
			expect(decode).toHaveBeenNthCalledWith(2, Buffer.from([...data2a, ...data2b]))
			expect(decode).toHaveBeenNthCalledWith(3, Buffer.from(data3))
			expect(decode).toHaveBeenCalledTimes(3)
		})
	})
})