export default {
  name: 'storeProduct',
  title: 'Store Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'priceDisplay',
      title: 'Price (display)',
      type: 'string',
      description: 'Exact text shown to visitors, e.g. "$15.00" or "$35.00 every 12 months"',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'storeCategory' }] }],
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: 'externalPurchaseUrl',
      title: 'Purchase URL (optional)',
      type: 'url',
      description:
        'Link to the live Square/Stripe product on eaa690.org, or another checkout page. If empty, the button links to the main chapter store.',
    },
    {
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers list first within the same category',
      initialValue: 0,
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      price: 'priceDisplay',
      media: 'image',
      active: 'isActive',
    },
    prepare(selection: Record<string, unknown>) {
      const title = selection.title as string | undefined
      const price = selection.price as string | undefined
      const active = selection.active as boolean | undefined
      return {
        title: title || 'Product',
        subtitle: [price, active === false ? '(hidden)' : ''].filter(Boolean).join(' '),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Sanity preview media typing
        media: selection.media as any,
      }
    },
  },
}
