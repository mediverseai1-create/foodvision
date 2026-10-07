import { PageTemplate } from '@/components/PageTemplate';

export const metadata = { title: 'Contact' };

export default function Contact() {
  return (
    <PageTemplate c={{
      eyebrow: 'Contact', title: ['Talk to', 'FoodVision AI.'], color: 'char',
      intro: 'For sales, security or support questions, email us and we will respond as soon as we can.',
      sections: [{ h: 'Email', p: 'mediverseai1@gmail.com — replace with your public support address before launch.' }],
    }} />
  );
}
