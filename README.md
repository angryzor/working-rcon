# Introduction
This is a Valve RCON implementation that tries to provide a working RCON library. This package was made after finding out that most of the implementations of the RCON protocol do not work correctly when used with Counter Strike: Global Offensive. This is not necessarily the fault of the library maintainers. The RCON protocol is not well defined and implementations vary wildly. In fact, CS:GO does not work well with most of the libraries mostly because it does not adhere to the authentication scheme described in Valve's documentation.

This package aims to be an RCON library that just works. We do not attempt to correctly implement the protocol as described in Valve's Developer Wiki, but instead attempt to make this library work on as many games as possible.

The current list of verified working games is:

* Counter Strike: Global Offensive

If you find out that this library works on a certain game, or, more importantly, doesn't work on a certain game, please let us know through the issue tracker on Github, and we will add it to this list or try to fix the issue.

# Installation

	npm install working-rcon

# Example usage

	const { connect, TimeoutError } = require('working-rcon')

	const main = async () => {
		try {
			const client = await connect('34.123.45.23', 27015, 'password', 5000)

			const status = await client.command('status')
			const stats = await client.command('stats')

			await client.end()

			console.log(status)
			console.log(stats)
		} catch (err) {
			if (err instanceof TimeoutError) {
				console.error('request timed out')
			} else {
				throw err
			}
		}
	}

# API Documentation

## connect(host: string, port: number, password: string, timeout: number = 1000): Promise&lt;RconClient&gt;
Creates a new connection and returns an RCON client object. Can throw a Node socket error if something goes
wrong during connecting. Can throw a `TimeoutError` if the authentication phase times out.

This call intentionally does not actually wait for an authentication response from the server,
because this sequence is not reliable on all servers. For instance on CS:GO servers there is no reliable
way to verify that the authentication was successful.

### Parameters

* _host_: The hostname of the target host.
* _port_: The port running the RCON server.
* _password_: The rcon password.
* _timeout_: A timeout that will be used when sending requests to the server. A `TimeoutError` will be thrown if this timeout is exceeded

### Return value
A promise that resolves to an instance of `RconClient`.

## RconClient#command(cmd: string): Promise&lt;string&gt;
Sends an RCON command to the server and returns the response.
The promise may reject with a `TimeoutError` if the timeout specified in the `connect` call is reached.

### Parameters

* _cmd_: The command to send.

### Return value
A promise that resolves to the response of the server.

## RconClient#end(): Promise&lt;undefined&gt;
Closes the RCON connection.

### Return value
A promise that resolves when the connection has been closed.
