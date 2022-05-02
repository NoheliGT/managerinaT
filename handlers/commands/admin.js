'use strict';

// Utils
const { html } = require('../../utils/html');
const { isMaster } = require('../../utils/config');
const { link, scheduleDeletion } = require('../../utils/tg');
const { parse, strip } = require('../../utils/cmd');

// DB
const {
	admin,
	getUser,
} = require('../../stores/user');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const adminHandler = async (ctx) => {
	if (!isMaster(ctx.from)) return null;

	const { targets } = parse(ctx.message);

	if (targets.length > 1) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Responde al mensaje de un usuario para promoverlo a administrador.</b>',
		).then(scheduleDeletion());
	}

	const userToAdmin = targets.length
		? await getUser(strip(targets[0]))
		: ctx.from;

	if (!userToAdmin) {
		return ctx.replyWithHTML(
			'ℹ️  <b>Usuario desconocido.</b>\n' +
			'Porfavor reenvía un mensaje e intenta de nuevo.',
		).then(scheduleDeletion());
	}

	if (userToAdmin.status === 'banned') {
		return ctx.replyWithHTML('ℹ️ <b>Imposible eliminar este usuario titán.</b>');
	}

	if (userToAdmin.status === 'admin') {
		return ctx.replyWithHTML(
			html`👷🏻‍♀️ ${link(userToAdmin)} <b>ya es administrador del grupo..</b>`,
		);
	}

	await admin(userToAdmin);

	return ctx.replyWithHTML(html`👷🏻‍♀️ ${link(userToAdmin)} <b> ahora es administrador.</b>`);
};

module.exports = adminHandler;
