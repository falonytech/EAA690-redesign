// Categories for store catalog filtering (memberships, food, prints, etc.)
export default {
  name: 'storeCategory',
  title: 'Store Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Shown in filters and on items (e.g. "Food & Breakfasts")',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional — shown in Studio only, or future use on /store',
    },
    {
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first in the filter list',
      initialValue: 0,
    },
  ],
  orderings: [
    {
      title: 'Sort order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    { title: 'Title', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return { title: title || 'Category', subtitle: subtitle ? `/${subtitle}` : '' }
    },
  },
}
