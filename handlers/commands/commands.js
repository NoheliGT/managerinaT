'use strict';

const R = require('ramda');

// DB
const { listCommands } = require('../../stores/command');

// cfg
const { isMaster } = require('../../utils/config');

const { scheduleDeletion } = require('../../utils/tg');

const masterCommands = `\
馃洝 <b> <i>Comandos de Owner:</i> </b>
<code>/admin</code> - Hace que el usuario administre el grupo.
<code>/unadmin</code> - Remueve a un usuario de la lista de administradores del Bot.
<code>/leave [nombre/ID]</code> - El Bot sale del grupo.
<code>/hidegroup</code> - Oculta el grupo de la lista de <code>/groups</code> donde se encuentra el Bot.
<code>/showgroup</code> - Revierte el comando anterior.\n
`;

const adminCommands = `\
馃洝 <b> <i>Comandos de Administrador:</i> </b>
<code>/del [raz贸n]</code> - Elimina un mensaje de un usuario.
<code>/slowmode</code> - Informaci贸n Antiflood.
<code>/warn [raz贸n]</code> - A帽ade una advertencia a un usuario.
<code>/unwarn</code> - Remueve/resta una advertencia del usuario.
<code>/nowarns</code> - Limpia/elimina todos las advertencias de un usuario.
<code>/permit</code> - Permite al usuario anunciar una vez, dentro de las 24 horas.
<code>/ban [raz贸n]</code> - Proh铆be al usuario de los grupos.
<code>/unban</code> - Remueve al usuario de la lista de baneados.
<code>/user</code> - Muestra el status del usuario, informaci贸n y advertencias.
<code>/addcommand [nombre]</code> - Crea un comando personalizado.
<code>/removecommand [nombre]</code> - Elimina un comando personalizado.\n
`;
const userCommands = `\
馃洝 <b> <i>Comandos para Todos:</i> </b>
<code>/staff</code> - Lista de administradores del grupo.
<code>/link</code> - Envia el link del grupo activo.
<code>/groups</code> - Lista de grupos donde el Bot es administrador.
<code>/report</code> - Hace un llamado/reporte a los administradores del grupo.\n
`;
const role = R.prop('role');
const name = R.prop('name');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const commandReferenceHandler = async (ctx) => {
	const customCommands = await listCommands();

	const customCommandsGrouped = R.groupBy(role, customCommands);
	const userCustomCommands = customCommandsGrouped.everyone
		? '[Todos]\n<code>' +
		customCommandsGrouped.everyone
			.map(name)
			.join(', ') +
		'</code>\n\n'
		: '';

	const adminCustomCommands = customCommandsGrouped.admins
		? '[Admins]\n<code>' +
		customCommandsGrouped.admins
			.map(name)
			.join(', ') +
		'</code>\n\n'
		: '';

	const masterCustomCommands = customCommandsGrouped.master
		? '[Due帽a]\n<code>' +
		customCommandsGrouped.master
			.map(name)
			.join(', ') +
		'</code>\n\n'
		: '';

	const customCommandsText = masterCommands.repeat(isMaster(ctx.from)) +
		adminCommands.repeat(ctx.from && ctx.from.status === 'admin') +
		userCommands +
		'\n馃洝 <b> <i>Comandos personalizados:</i> (funcionan tambien con !):</b>\n' +
		masterCustomCommands.repeat(isMaster(ctx.from)) +
		adminCustomCommands.repeat(ctx.from && ctx.from.status === 'admin') +
		userCustomCommands;

	return ctx.replyWithHTML(customCommandsText)
		.then(scheduleDeletion());
};

module.exports = commandReferenceHandler;
