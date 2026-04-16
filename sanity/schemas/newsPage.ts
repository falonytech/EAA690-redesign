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
      description: 'Describe the image for screen readers (required when hero image is set).',
      validation: (Rule: any) => Rule.max(200),
    },
  ],
  preview: {
    prepare() {
      return { title: 'News Page' }
    },
  },
}
