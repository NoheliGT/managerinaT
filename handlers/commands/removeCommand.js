'use strict';

// DB
const { getCommand, removeCommand } = require('../../stores/command');

const { isMaster } = require('../../utils/config');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const removeCommandHandler = async (ctx) => {
	const { text } = ctx.message;
	if (ctx.chat.type !== 'private') return null;

	if (ctx.from.status !== 'admin') {
		return ctx.replyWithHTML(
			'ℹ️ <b>Lo siento, solo administradores pueden usar este comando.</b>',
		);
	}
	const [ , commandName ] = text.split(' ');
	if (!commandName) {
		return ctx.replyWithHTML(
			'<b>Envía un comando valido.</b>\n\nEjemplo:\n' +
			'<code>/removecommand reglas</code>',
		);
	}

	const command = await getCommand({ name: commandName.toLowerCase() });
	if (!command) {
		return ctx.replyWithHTML(
			'ℹ️ <b>No encuentro este comando titán.</b>',
		);
	}

	const role = command.role.toLowerCase();
	if (role === 'master' && !isMaster(ctx.from)) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Lo siento solo mi dueño puede eliminar este comando.</b>',
		);
	}

	await removeCommand({ name: commandName.toLowerCase() });
	return ctx.replyWithHTML(
		`✅ <code>!${commandName}</code> ` +
		'<b>ha sido eliminado correctamente.</b>',
	);
};

module.exports = removeCommandHandler;
