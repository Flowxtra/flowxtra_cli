import { Args, Flags, ux } from "@oclif/core";
import open from "open";
import { BaseCommand } from "../../base";
import { ui, cyan, teal } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, toItem, pick, str } from "../../lib/format";

export default class JobsPromote extends BaseCommand<typeof JobsPromote> {
  static description = "Generate social images for a job and post it to your connected accounts";
  static examples = [
    "$ flowxtra jobs promote 8f2a",
    "$ flowxtra jobs promote 8f2a --image 3 --account 1 --account 2",
    "$ flowxtra jobs promote 8f2a --post-type story --open --dry-run",
  ];

  static args = {
    job: Args.string({ description: "Job ID or hash ID", required: true }),
  };

  static flags = {
    "post-type": Flags.string({ description: "Image format", options: ["post", "story", "reel"], default: "post" }),
    image: Flags.integer({ description: "Pick image variant number (skip the prompt)" }),
    content: Flags.string({ description: "Post caption (defaults to an auto-draft)" }),
    account: Flags.integer({ description: "Social account ID to post to (repeatable)", multiple: true }),
    open: Flags.boolean({ description: "Open the chosen image in your browser", default: false }),
    "dry-run": Flags.boolean({ description: "Generate + draft only, don't post", default: false }),
    yes: Flags.boolean({ description: "Skip the confirmation prompt", default: false }),
  };

  async run(): Promise<void> {
    const api = new FlowxtraApi();
    const interactive = Boolean(process.stdout.isTTY) && !this.wantsJson;
    const job = this.args.job;

    const spinner = this.wantsJson ? null : ui.spinner("Generating social images…").start();
    let jobObj: Record<string, unknown> = {};
    let accounts: Record<string, unknown>[] = [];
    let images: string[] = [];
    try {
      const [jobRes, accRes, genRes] = await Promise.all([
        api.get(`jobs/show/${encodeURIComponent(job)}`).catch(() => null),
        api.get("social-accounts").then(toList).catch(() => []),
        api.post(`jobs/${encodeURIComponent(job)}/generate-social-images`, { post_type: this.flags["post-type"] }),
      ]);
      jobObj = jobRes ? toItem(jobRes) : {};
      accounts = accRes;
      const data = (genRes as { data?: unknown })?.data;
      images = Array.isArray(data) ? (data as string[]) : [];
    } finally {
      spinner?.stop();
    }

    if (images.length === 0) {
      ui.error("Couldn't generate social images for this job.");
      this.exit(1);
      return;
    }

    const title = str(pick(jobObj, ["title", "name"])) || `Job ${job}`;
    const applyUrl = str(pick(jobObj, ["urlJobApplay", "apply_url"]));

    // ── choose an image ──
    let choice = this.flags.image;
    if (!choice) {
      if (interactive) {
        ui.heading(`Generated ${images.length} image variants for “${title}”`);
        images.forEach((u, i) => process.stdout.write(`  ${cyan(String(i + 1).padStart(2))}  ${u}\n`));
        const answer = await ux.prompt(`Pick an image (1-${images.length})`, { default: "1" });
        choice = parseInt(answer, 10) || 1;
      } else {
        choice = 1;
      }
    }
    choice = Math.min(Math.max(choice, 1), images.length);
    const chosen = images[choice - 1];

    if (this.flags.open) await open(chosen).catch(() => {});

    // ── caption ──
    const content = this.flags.content || `We're hiring: ${title}!${applyUrl ? ` Apply now: ${applyUrl}` : ""}`;

    // ── accounts ──
    let accountIds = this.flags.account ?? [];
    if (accountIds.length === 0 && interactive && accounts.length > 0) {
      ui.heading("Connected social accounts");
      accounts.forEach((a) => process.stdout.write(`  ${cyan(str(pick(a, ["id"])))}  ${str(pick(a, ["platform", "provider"]))} · ${str(pick(a, ["name", "username"]))}\n`));
      const answer = await ux.prompt("Post to which account IDs? (comma-separated, blank to skip)", { default: "" });
      accountIds = answer.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    }

    // ── dry-run / no accounts: show the draft and stop ──
    if (this.wantsJson) {
      ui.json({ job, title, chosenImage: chosen, imageNumber: choice, images, content, accountIds });
      return;
    }
    if (this.flags["dry-run"] || accountIds.length === 0) {
      ui.heading("Draft post");
      process.stdout.write(`  ${teal("Image")}  ${chosen}\n`);
      process.stdout.write(`  ${teal("Text")}   ${content}\n`);
      if (accountIds.length === 0) {
        ui.hint("\n  No social account selected. Connect one in the dashboard, then post with:");
        ui.hint(`  flowxtra social post --content "…" --account <id> --field media[]=${chosen}`);
      } else {
        ui.hint(`\n  Re-run without --dry-run to publish to ${accountIds.length} account(s).`);
      }
      return;
    }

    // ── confirm + publish ──
    if (!this.flags.yes && interactive) {
      const ok = await ux.confirm(`Publish to ${accountIds.length} account(s)? (y/n)`);
      if (!ok) {
        ui.info("Cancelled.");
        return;
      }
    }

    const spin2 = ui.spinner("Publishing post…").start();
    let res: unknown;
    try {
      res = await api.post("posts", { content, social_account_ids: accountIds, media: [chosen] });
    } finally {
      spin2.stop();
    }
    ui.success(`Posted “${title}” to ${accountIds.length} account(s).`);
    void res;
  }
}
