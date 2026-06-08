import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class SocialPosts extends BaseCommand<typeof SocialPosts> {
  static description = "List social media posts";
  static examples = ["$ flowxtra social posts"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading posts…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("posts");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No posts yet.");
      return;
    }
    ui.heading(`Posts (${rows.length})`);
    ui.table(
      ["ID", "Status", "Platforms", "Content"],
      rows.map((p) => {
        const content = str(pick(p, ["content", "text", "caption", "body"]));
        return [
          str(pick(p, ["id"])),
          str(pick(p, ["status", "state"])) || "—",
          str(pick(p, ["platforms", "platform", "accounts"])) || "—",
          content.length > 48 ? `${content.slice(0, 47)}…` : content || "—",
        ];
      }),
    );
  }
}
