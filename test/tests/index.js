import { expect } from 'jest'
import packet from '../../src/packet'
import { __RewireAPI__ as __index } from '../../src/index'

describe('RconClient', () => {
	describe('#_onReceiveData', () => {
		test('should correctly packetize single packet data buffers', () => {
			const pkt = {}
			const rconClient = { _pendingPacket: null }
			const data = Buffer.from([
				0x0a, 0x00, 0x00, 0x00,
				0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
			])
			const RconClient = __index.__GetDependency__('RconClient')

			packet.decode = jest.fn()
				.mockReturnValueOnce(pkt)

			expect(RconClient.prototype._onReceiveData.call(rconClient, data)).toBe(pkt)
			expect(packet.decode).toHaveBeenCalledWith()
		})
	})
})