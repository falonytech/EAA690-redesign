// Singleton: News page settings (hero image, etc.)
export default {
  name: 'newsPage',
  title: 'News Page',
  type: 'document',
  fields: [
    {
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-width banner shown above the news article list.',
    },
    {
      name: 'heroImageAlt',
      title: 'Hero image alt text',
      type: 'string',
      description: 'Describe the image for screen readers. Required when a hero image is set — leave blank only if the image is purely decorative.',
      validation: (Rule: any) =>
        Rule.max(200).custom((value: string | undefined, context: { parent?: { heroImage?: unknown } }) => {
          if (context.parent?.heroImage && !value?.trim()) {
            return 'Alt text is required when a hero image is set'
          }
          return true
        }),
    },
  ],
  preview: {
    prepare() {
      return { title: 'News Page' }
    },
  },
}
