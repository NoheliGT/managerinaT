'use strict';

// Utils
const { html } = require('../../utils/html');
const { isMaster } = require('../../utils/config');
const { link, scheduleDeletion } = require('../../utils/tg');
const { parse, strip } = require('../../utils/cmd');

// Bot
const { telegram } = require('../../bot');

// DB
const { getUser, unadmin } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const noop = Function.prototype;

const tgUnadmin = async (userToUnadmin) => {
	for (const group of await listGroups()) {
		telegram.promoteChatMember(group.id, userToUnadmin.id, {
			can_change_info: false,
			can_delete_messages: false,
			can_invite_users: false,
			can_pin_messages: false,
			can_promote_members: false,
			can_restrict_members: false,
		}).catch(noop);
	}
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const unAdminHandler = async (ctx) => {
	if (!isMaster(ctx.from)) return null;

	const { targets } = parse(ctx.message);

	if (targets.length !== 1) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Responde al mensaje de un usuario para eliminarlo de la lista de administradores.</b>',
		).then(scheduleDeletion());
	}

	const userToUnadmin = await getUser(strip(targets[0]));

	if (!userToUnadmin) {
		return ctx.replyWithHTML(
			'❓ <b>Usuario desconocido.</b>',
		).then(scheduleDeletion());
	}

	if (userToUnadmin.status !== 'admin') {
		return ctx.replyWithHTML(
			html`ℹ️ ${link(userToUnadmin)} <b>este usuario no es administrador del grupo titán.</b>`,
		);
	}

	await tgUnadmin(userToUnadmin);

	await unadmin(userToUnadmin);

	return ctx.replyWithHTML(
		html`⚔️ ${link(userToUnadmin)} <b> fue eliminado de la lista de administradores.</b>`,
	);
};

module.exports = unAdminHandler;
