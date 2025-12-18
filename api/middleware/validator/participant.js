import vine from "@vinejs/vine";

const createSchema = vine.object({
  user_id: vine.number().withoutDecimals(),
});

const deleteSchema = vine.object({
  user_id: vine.number().withoutDecimals(),
});



export const
  create = vine.compile(createSchema),
  remove = vine.compile(deleteSchema);
