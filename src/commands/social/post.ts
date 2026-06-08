import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

export default class SocialPost extends BaseCommand<typeof SocialPost> {
  static description = "Create a social media post";
  static examples = [
    '$ flowxtra social post --content "We are hiring a Senior Backend Engineer!" --account 1 --account 2',
  ];

  static flags = {
    content: Flags.string({ description: "Post text / caption", required: true }),
    account: Flags.integer({ description: "Social account ID to post to (repeatable)", multiple: true }),
    schedule: Flags.string({ description: "Schedule for later (e.g. \"2026-06-10 09:00\")" }),
    media: Flags.string({ description: "Image/media URL to attach (repeatable)", multiple: true }),
    field: Flags.string({ description: "Extra body field as key=value (repeatable)", multiple: true }),
  };

  async run(): Promise<void> {
    const body: Record<string, unknown> = { content: this.flags.content };
    if (this.flags.account?.length) body.social_account_ids = this.flags.account;
    if (this.flags.schedule) body.scheduled_at = this.flags.schedule;
    if (this.flags.media?.length) body.media = this.flags.media;
    for (const kv of this.flags.field ?? []) {
      const i = kv.indexOf("=");
      if (i > 0) body[kv.slice(0, i)] = kv.slice(i + 1);
    }

    const spinner = this.wantsJson ? null : ui.spinner("Publishing post…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post("posts", body);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(this.flags.schedule ? `Post scheduled for ${this.flags.schedule}` : "Post published");
  }
}
