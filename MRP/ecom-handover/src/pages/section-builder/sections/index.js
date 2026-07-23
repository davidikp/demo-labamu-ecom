/**
 * @module section-builder/sections/index
 * @description Registry of real per-type `schema.js` + `Renderer.jsx` pairs
 * (Epic 11). Replaces Phase 3's placeholderSchemas.js entirely — SettingsPanel
 * and Canvas both look sections up here now.
 */
import { schema as headerSchema } from './header/schema';
import HeaderRenderer from './header/Renderer';
import { schema as footerSchema } from './footer/schema';
import FooterRenderer from './footer/Renderer';
import { schema as heroBannerSchema } from './hero_banner/schema';
import HeroBannerRenderer from './hero_banner/Renderer';
import { schema as announcementBarSchema } from './announcement_bar/schema';
import AnnouncementBarRenderer from './announcement_bar/Renderer';
import { schema as featuredProductsSchema } from './featured_products/schema';
import FeaturedProductsRenderer from './featured_products/Renderer';
import { schema as collectionListSchema } from './collection_list/schema';
import CollectionListRenderer from './collection_list/Renderer';
import { schema as imageWithTextSchema } from './image_with_text/schema';
import ImageWithTextRenderer from './image_with_text/Renderer';
import { schema as richTextSchema } from './rich_text/schema';
import RichTextRenderer from './rich_text/Renderer';
import { schema as brandValuesSchema } from './brand_values/schema';
import BrandValuesRenderer from './brand_values/Renderer';
import { schema as testimonialsSchema } from './testimonials/schema';
import TestimonialsRenderer from './testimonials/Renderer';
import { schema as newsletterSignupSchema } from './newsletter_signup/schema';
import NewsletterSignupRenderer from './newsletter_signup/Renderer';
import { schema as contactFormSchema } from './contact_form/schema';
import ContactFormRenderer from './contact_form/Renderer';
import { schema as faqAccordionSchema } from './faq_accordion/schema';
import FaqAccordionRenderer from './faq_accordion/Renderer';
import { schema as dividerSpacerSchema } from './divider_spacer/schema';
import DividerSpacerRenderer from './divider_spacer/Renderer';

export const SECTION_DEFINITIONS = {
  header: { schema: headerSchema, Renderer: HeaderRenderer },
  footer: { schema: footerSchema, Renderer: FooterRenderer },
  hero_banner: { schema: heroBannerSchema, Renderer: HeroBannerRenderer },
  announcement_bar: { schema: announcementBarSchema, Renderer: AnnouncementBarRenderer },
  featured_products: { schema: featuredProductsSchema, Renderer: FeaturedProductsRenderer },
  collection_list: { schema: collectionListSchema, Renderer: CollectionListRenderer },
  image_with_text: { schema: imageWithTextSchema, Renderer: ImageWithTextRenderer },
  rich_text: { schema: richTextSchema, Renderer: RichTextRenderer },
  brand_values: { schema: brandValuesSchema, Renderer: BrandValuesRenderer },
  testimonials: { schema: testimonialsSchema, Renderer: TestimonialsRenderer },
  newsletter_signup: { schema: newsletterSignupSchema, Renderer: NewsletterSignupRenderer },
  contact_form: { schema: contactFormSchema, Renderer: ContactFormRenderer },
  faq_accordion: { schema: faqAccordionSchema, Renderer: FaqAccordionRenderer },
  divider_spacer: { schema: dividerSpacerSchema, Renderer: DividerSpacerRenderer },
};

export function schemaForType(type) {
  return SECTION_DEFINITIONS[type]?.schema ?? {};
}
