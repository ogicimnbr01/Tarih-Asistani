
import { ReactElement } from 'react';

export interface Feature {
  icon: ReactElement;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
}
