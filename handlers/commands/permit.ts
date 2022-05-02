import { displayUser, scheduleDeletion } from "../../utils/tg";
import { html, lrm } from "../../utils/html";
import { parse, strip } from "../../utils/cmd";
import type { ExtendedContext } from "../../typings/context";
import { permit } from "../../stores/user";

export = async (ctx: ExtendedContext) => {
	if (ctx.from?.status !== "admin") return null;

	const { targets } = parse(ctx.message);
	if (targets.length !== 1) {
		return ctx
			.replyWithHTML("ℹ️ <b>Especificar un usuario para ser libre.</b>")
			.then(scheduleDeletion());
	}

	const permitted = await permit(strip(targets[0]), {
		by_id: ctx.from.id,
		date: new Date(),
	});

	return ctx.replyWithHTML(html`
		🎟 ${lrm}${ctx.from.first_name} <b>ha permitido a</b> ${displayUser(permitted)} ser libre por 24 Hrs.
	`);
};
