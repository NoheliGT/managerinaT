'use strict';
const { Markup } = require('telegraf');
const { homepage } = require('../../package.json');

const message = `<b>¡Bienvenido!</b>, soy Rina Tennoji y te ayudaré a administrar tu grupo de una manera eficaz y sencilla para y contra los spammers. \n
Por ahora solo trabajo de manera 📵restringida por lo que si requieres mi trabajo, contacta mi dueña (@GNoheGremory)
para mas información.
Envía /commands para ver la lista de comandos disponibles.
`;

/** @param { import('../../typings/context').ExtendedContext } ctx */
const helpHandler = (ctx) => {
	if (ctx.chat.type !== 'private') return null;

	return ctx.replyWithHTML(
		message,
		Markup.inlineKeyboard([
			Markup.button.url('⛑ Grupo Soporte de Gawr Gura Bot', homepage)
		])
	);
};

module.exports = helpHandler;
