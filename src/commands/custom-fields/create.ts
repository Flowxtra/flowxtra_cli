import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toItem, pick, str } from "../../lib/format";

export default class CustomFieldsCreate extends BaseCommand<typeof CustomFieldsCreate> {
  static description = "Create a company custom field";
  static examples = [
    '$ flowxtra custom-fields create --label "Department" --type text',
    '$ flowxtra custom-fields create --label "Seniority" --type select --value Junior --value Mid --value Senior',
  ];

  static flags = {
    label: Flags.string({ description: "Field label shown to users", required: true }),
    type: Flags.string({ description: "Field type", default: "text", options: ["text", "number", "date", "select", "chips_multi", "boolean"] }),
    required: Flags.boolean({ description: "Make the field required", default: false }),
    placeholder: Flags.string({ description: "Placeholder text" }),
    description: Flags.string({ description: "Helper description" }),
    value: Flags.string({ description: "Option value for select/chips fields (repeatable)", multiple: true }),
    field: Flags.string({ description: "Extra body field as key=value (repeatable)", multiple: true }),
  };

  async run(): Promise<void> {
    const body: Record<string, unknown> = {
      label: this.flags.label,
      type: this.flags.type,
      is_required: this.flags.required,
    };
    if (this.flags.placeholder) body.placeholder = this.flags.placeholder;
    if (this.flags.description) body.description = this.flags.description;
    if (this.flags.value?.length) {
      body.values = this.flags.value.map((name, i) => ({ name, order: i, is_enabled: true }));
    }
    for (const kv of this.flags.field ?? []) {
      const i = kv.indexOf("=");
      if (i > 0) body[kv.slice(0, i)] = kv.slice(i + 1);
    }

    const spinner = this.wantsJson ? null : ui.spinner("Creating custom field…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post("custom-fields/store", body);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    const f = toItem(res);
    ui.success(`Created custom field “${this.flags.label}” (${str(pick(f, ["id"]))})`);
  }
}
