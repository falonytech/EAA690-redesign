// Singleton: settings and hero content for the /media index page
export default {
  name: 'mediaPage',
  title: 'Media Page',
  type: 'document',
  fields: [
    {
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-width banner shown above the gallery listing.',
    },
    {
      name: 'heroImageAlt',
      title: 'Hero image alt text',
      type: 'string',
      description: 'Required when a hero image is set.',
      validation: (Rule: any) =>
        Rule.max(200).custom(
          (value: string | undefined, context: { parent?: { heroImage?: unknown } }) => {
            if (context.parent?.heroImage && !value?.trim()) {
              return 'Alt text is required when a hero image is set'
            }
            return true
          }
        ),
    },
    {
      name: 'pageTitle',
      title: 'Page title',
      type: 'string',
      initialValue: 'Media',
      description: 'Heading shown at the top of the page.',
    },
    {
      name: 'pageDescription',
      title: 'Page description',
      type: 'text',
      rows: 3,
      description: 'Short introductory text shown under the page title.',
    },
  ],
  preview: {
    prepare() {
      return { title: 'Media Page' }
    },
  },
}
