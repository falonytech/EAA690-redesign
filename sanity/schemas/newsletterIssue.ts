// NAVCOM — chapter newsletter issues (web + optional PDF)
export default {
  name: 'newsletterIssue',
  title: 'NAVCOM Issue',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "April 2026" or "NAVCOM — April 2026"',
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
      name: 'issueDate',
      title: 'Issue date',
      type: 'datetime',
      description: 'Used for sorting and the public archive.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'volumeLabel',
      title: 'Volume / issue label',
      type: 'string',
      description: 'Optional — e.g. "Vol. 45 No. 4"',
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary for listings and search.',
    },
    {
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'content',
      title: 'Web content',
      type: 'array',
      description: 'Optional HTML version. Leave empty for PDF-only issues.',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    },
    {
      name: 'pdf',
      title: 'PDF file',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      description: 'Upload the issue PDF here when not using an external link.',
    },
    {
      name: 'pdfUrl',
      title: 'External PDF link',
      type: 'url',
      description: 'e.g. Google Drive — use when the PDF is hosted elsewhere.',
    },
    {
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Overrides browser title; defaults to issue title.',
    },
    {
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
    },
  ],
  orderings: [
    {
      title: 'Issue date (newest first)',
      name: 'issueDateDesc',
      by: [{ field: 'issueDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'issueDate',
      media: 'coverImage',
    },
    prepare({ title, date }: { title?: string; date?: string }) {
      return {
        title: title || 'Untitled',
        subtitle: date
          ? new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })
          : 'No date',
      }
    },
  },
}
