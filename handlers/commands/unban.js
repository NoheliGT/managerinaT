// @ts-check
'use strict';

// Utils
const { displayUser, scheduleDeletion } = require('../../utils/tg');
const { html, lrm } = require('../../utils/html');
const { parse, strip } = require('../../utils/cmd');
const { pMap } = require('../../utils/promise');

// DB
const { listGroups } = require('../../stores/group');
const { getUser, unban } = require('../../stores/user');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const unbanHandler = async (ctx) => {
	if (ctx.from?.status !== 'admin') return null;

	const { targets } = parse(ctx.message);

	if (targets.length !== 1) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Especifica un usuario para desbanearlo.</b>',
		).then(scheduleDeletion());
	}

	const userToUnban = await getUser(strip(targets[0]));

	if (!userToUnban) {
		return ctx.replyWithHTML(
			'❓ <b>Usuario desconocido.</b>',
		).then(scheduleDeletion());
	}


	if (userToUnban.status !== 'banned') {
		return ctx.replyWithHTML('ℹ️ <b>Este usuario no ha sido prohibido del grupo.</b>');
	}

	await pMap(await listGroups({ type: 'supergroup' }), (group) =>
		ctx.tg.unbanChatMember(group.id, userToUnban.id));

	await unban(userToUnban);

	ctx.tg.sendMessage(
		userToUnban.id,
		'♻️ Estas libre.',
	).catch(() => null);
	// it's likely that the banned person haven't PMed the bot,
	// which will cause the sendMessage to fail,
	// hance .catch(noop)
	// (it's an expected, non-critical failure)


	return ctx.loggedReply(html`
	✅ ${lrm}${ctx.from.first_name} <b> ha sido desbaneado correctamente titán.</b> ${displayUser(userToUnban)}.
	`);
};

module.exports = unbanHandler;
