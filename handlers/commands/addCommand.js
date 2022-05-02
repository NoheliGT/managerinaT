'use strict';

// DB
const { addCommand, getCommand } = require('../../stores/command');

// Bot
const { Markup } = require('telegraf');

const Cmd = require('../../utils/cmd');
const { isMaster } = require('../../utils/config');
const { inlineKeyboard } = require('../../utils/tg');

const preserved = require('../commands').handlers;

const roleBtn = (btRole, { newCommand, currentRole }) => {
	const noop = btRole.toLowerCase() === currentRole.toLowerCase();
	return {
		text: '✅ '.repeat(noop) + btRole,
		callback_data: Cmd.stringify({
			command: 'addcommand',
			flags: {
				noop,
				role: btRole,
				replace: 'soft',
			},
			reason: newCommand,
		}),
	};
};

const roleKbRow = (cmdData) => [
	roleBtn('Admins', cmdData),
	roleBtn('Todos', cmdData),
];

const normalizeRole = (role = '') => {
	const lower = role.toLowerCase();
	return lower === 'master' || lower === 'admins'
		? lower
		: 'everyone';
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const addCommandHandler = async (ctx) => {
	const { chat, message, reply } = ctx;
	if (chat.type === 'channel') return null;
	const { id } = ctx.from;

	if (ctx.from.status !== 'admin') {
		return ctx.replyWithHTML(
			'ℹ️ <b>Lo siento solo administradores pueden usar este comando.</b>',
		);
	}

	const { flags, reason: commandName } = Cmd.parse(message);
	if (flags.has('noop')) return null;

	const isValidName = /^!?(\w+)$/.exec(commandName);
	if (!isValidName) {
		return ctx.replyWithHTML(
			'<b>Envia un comando valido.</b>\n\nEjemplo:\n' +
			'<code>/addcommand reglas</code>',
		);
	}
	const newCommand = isValidName[1].toLowerCase();
	if (preserved.has(newCommand)) {
		return reply('❗️ No puedes usar este nombre para el comando titán.\n\n' +
			'Try another one.');
	}

	const replaceCmd = flags.has('replace');
	const content = message.reply_to_message;

	const cmdExists = await getCommand({ isActive: true, name: newCommand });

	if (!replaceCmd && cmdExists) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Este comando ya existe.</b>\n\n' +
			'/commands - Lista de comandos guardados.\n' +
			'/addcommand <code>[nombre]</code> - Agrega un nuevo comando.\n' +
			'/removecommand <code>[nombre]</code>' +
			' - elimina un comando existente.',
			Markup.keyboard([ [ `/addcommand -replace ${newCommand}` ] ])
				.selective()
				.oneTime()
				.resize(),
		);
	}
	if (cmdExists && cmdExists.role === 'master' && !isMaster(ctx.from)) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Lo siento solo mi dueño puede usar este comando.</b>',
		);
	}

	const softReplace = flags.get('replace') === 'soft';
	if (content || softReplace) {
		const role = normalizeRole(flags.get('role'));
		await addCommand({
			id,
			role,
			type: 'copy',
			caption: null,
			isActive: true,
			name: newCommand,
			...softReplace || { content },
		});
		return ctx.replyWithHTML(
			`✅ <b>Comando guardado: <code>!${isValidName[1]}</code></b>.\n` +
			'¿Quienes podrán usar este comando?',
			inlineKeyboard(roleKbRow({ currentRole: role, newCommand })),
		);
	}

	// eslint-disable-next-line max-len
	return ctx.replyWithHTML('ℹ️ <b>Responde al mensaje que te gustaría guardar para crear el comando.</b>');
};

module.exports = addCommandHandler;
