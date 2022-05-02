import { Context, Middleware } from "telegraf";
import { addGroup } from "../../stores/group";
import { admin } from "../../stores/user";
import { isMaster } from "../../utils/config";

const addedToGroupHandler: Middleware<Context> = async (ctx, next) => {
	const wasAdded = ctx.message?.new_chat_members?.some(
		(user) => user.username === ctx.me
	);
	if (wasAdded && isMaster(ctx.from)) {
		await admin(ctx.from!);
		const link = ctx.chat!.username
			? `https://t.me/${ctx.chat!.username.toLowerCase()}`
			: await ctx.exportChatInviteLink().catch(() => "");
		if (!link) {
			await ctx.replyWithHTML(
				"⚠️ <b>No se pudo exportar el enlace de invitación de chat.</b>\n" +
					"El grupo no será visible en la lista de /groups.\n" +
					"\n" +
					"Si esta no es tu intención, " +
					"asegúrese de que se me permita exportar el enlace de invitación de chat, " +
					"y luego corre /showgroup."
			);
		}
		const { id, title, type } = ctx.chat!;
		await addGroup({ id, link, title, type });
		await ctx.replyWithHTML(
			"🛠 <b>Muy bien, a partir de ahora te ayudaré a mantener el control de tu grupo.</b>"
		);
	}

	return next();
};

export = addedToGroupHandler;
