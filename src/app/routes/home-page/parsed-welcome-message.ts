import { MdNode } from "../../classes/markdown";

export const ParsedWelcomeMessage: MdNode = {
  type: 'document',
  content: [
    {
      type: 'text',
      content: '',
    },
    {
      type: 'img',
      content: [
        {
          type: 'text',
          content: 'Efe   Enes   Çamcı',
        },
      ],
      url: 'https://avatars.githubusercontent.com/u/79850104?v=4',
    },
    {
      type: 'br',
      content: '',
    },
    {
      type: 'br',
      content: '',
    },
    {
      type: 'h1',
      content: [
        {
          type: 'text',
          content: '  Efe   Enes   Çamcı',
        },
      ],
    },
    {
      type: 'h3',
      content: [
        {
          type: 'text',
          content: '  Solutions   Architect',
        },
      ],
    },
    {
      type: 'br',
      content: '',
    },
    {
      type: 'text',
      content:
        'I   develop   websites,   desktop   programs,   mobile   apps;   increase   organizational   security,   automate   business-critical   workflows,   manage   cloud   infrastructure;   experiment   with   ideas,   take   on   new   challenges,   reinvent   the   wheel,   and   have   fun.',
    },
    {
      type: 'br',
      content: '',
    },
    {
      type: 'b',
      content: [
        {
          type: 'a',
          content: [
            {
              type: 'text',
              content: 'GitHub',
            },
          ],
          url: 'https://github.com/efeenesc',
        },
      ],
    },
    {
      type: 'text',
      content: '  -  ',
    },
    {
      type: 'b',
      content: [
        {
          type: 'a',
          content: [
            {
              type: 'text',
              content: 'LinkedIn',
            },
          ],
          url: 'https://linkedin.com/in/efeenescamci',
        },
      ],
    },
    {
      type: 'text',
      content: '  -  ',
    },
    {
      type: 'b',
      content: [
        {
          type: 'a',
          content: [
            {
              type: 'text',
              content: 'E-mail',
            },
          ],
          url: 'mailto:hello@efeenescamci.com',
        },
      ],
    },
    {
      type: 'br',
      content: '',
    },
  ],
};
