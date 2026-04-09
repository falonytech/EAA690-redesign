// Site-wide settings (singleton)
export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'EAA 690',
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 3,
    },
    {
      name: 'breakfastPrice',
      title: 'Pancake Breakfast Price',
      type: 'string',
      description: 'e.g., "$10/each"',
    },
    {
      name: 'breakfastTime',
      title: 'Breakfast Serving Time',
      type: 'string',
      description: 'e.g., "8:00 to 10:00 AM"',
    },
    {
      name: 'newsletterUrl',
      title: 'Latest Newsletter URL',
      type: 'url',
      description: 'Link to the latest newsletter PDF',
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        { name: 'facebook', title: 'Facebook URL', type: 'url' },
        { name: 'twitter', title: 'Twitter/X URL', type: 'url' },
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'youtube', title: 'YouTube URL', type: 'url' },
      ],
    },
    {
      name: 'siteAnnouncement',
      title: 'Site-wide announcement',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'enabled',
          title: 'Show announcement banner',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'message',
          title: 'Message',
          type: 'text',
          rows: 2,
          description: 'Shown below the main nav on every public page when enabled.',
        },
        {
          name: 'linkUrl',
          title: 'Optional link URL',
          type: 'url',
        },
        {
          name: 'linkText',
          title: 'Link label',
          type: 'string',
          description: 'e.g. "Details" or "Read more"',
        },
        {
          name: 'style',
          title: 'Style',
          type: 'string',
          initialValue: 'info',
          options: {
            list: [
              { title: 'Info (blue)', value: 'info' },
              { title: 'Warning (amber)', value: 'warning' },
              { title: 'Neutral (gray)', value: 'neutral' },
            ],
            layout: 'radio',
          },
        },
        {
          name: 'startDate',
          title: 'Show on or after (optional)',
          type: 'date',
          description: 'First calendar day to show the banner. Leave empty to show immediately.',
        },
        {
          name: 'endDate',
          title: 'Last day to show (optional)',
          type: 'date',
          description: 'Banner hides after this date.',
        },
      ],
    },
    {
      name: 'storeSectionVisible',
      title: 'Show chapter store',
      type: 'boolean',
      initialValue: true,
      description:
        'Turn off to remove Store and cart from the navigation and show a notice on /store.',
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
}
