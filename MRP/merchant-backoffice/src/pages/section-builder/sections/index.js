/**
 * @module section-builder/sections/index
 * @description Registry of real per-type `schema.js` + `Renderer.jsx` pairs
 * (Epic 11), plus each section's optional `blockConfig` (Shopify-style blocks).
 * SettingsPanel, Canvas, Sidebar, and blockHelpers all look sections up here.
 */
import { schema as headerSchema } from './header/schema';
import HeaderRenderer from './header/Renderer';
import { schema as footerSchema } from './footer/schema';
import FooterRenderer from './footer/Renderer';
import { schema as heroBannerSchema, blockConfig as heroBannerBlocks } from './hero_banner/schema';
import HeroBannerRenderer from './hero_banner/Renderer';
import { schema as announcementBarSchema, blockConfig as announcementBarBlocks } from './announcement_bar/schema';
import AnnouncementBarRenderer from './announcement_bar/Renderer';
import { schema as videoBannerSchema, blockConfig as videoBannerBlocks } from './video_banner/schema';
import VideoBannerRenderer from './video_banner/Renderer';
import { schema as featuredProductsSchema, blockConfig as featuredProductsBlocks } from './featured_products/schema';
import FeaturedProductsRenderer from './featured_products/Renderer';
import { schema as collectionListSchema, blockConfig as collectionListBlocks } from './collection_list/schema';
import CollectionListRenderer from './collection_list/Renderer';
import { schema as productCarouselSchema, blockConfig as productCarouselBlocks } from './product_carousel/schema';
import ProductCarouselRenderer from './product_carousel/Renderer';
import { schema as productSpotlightSchema, blockConfig as productSpotlightBlocks } from './product_spotlight/schema';
import ProductSpotlightRenderer from './product_spotlight/Renderer';
import { schema as imageWithTextSchema, blockConfig as imageWithTextBlocks } from './image_with_text/schema';
import ImageWithTextRenderer from './image_with_text/Renderer';
import { schema as richTextSchema, blockConfig as richTextBlocks } from './rich_text/schema';
import RichTextRenderer from './rich_text/Renderer';
import { schema as brandValuesSchema, blockConfig as brandValuesBlocks } from './brand_values/schema';
import BrandValuesRenderer from './brand_values/Renderer';
import { schema as teamAboutSchema, blockConfig as teamAboutBlocks } from './team_about/schema';
import TeamAboutRenderer from './team_about/Renderer';
import { schema as testimonialsSchema, blockConfig as testimonialsBlocks } from './testimonials/schema';
import TestimonialsRenderer from './testimonials/Renderer';
import { schema as starRatingBarSchema, blockConfig as starRatingBarBlocks } from './star_rating_bar/schema';
import StarRatingBarRenderer from './star_rating_bar/Renderer';
import { schema as pressLogosSchema, blockConfig as pressLogosBlocks } from './press_logos/schema';
import PressLogosRenderer from './press_logos/Renderer';
import { schema as newsletterSignupSchema, blockConfig as newsletterSignupBlocks } from './newsletter_signup/schema';
import NewsletterSignupRenderer from './newsletter_signup/Renderer';
import { schema as countdownTimerSchema, blockConfig as countdownTimerBlocks } from './countdown_timer/schema';
import CountdownTimerRenderer from './countdown_timer/Renderer';
import { schema as promotionalBannerSchema, blockConfig as promotionalBannerBlocks } from './promotional_banner/schema';
import PromotionalBannerRenderer from './promotional_banner/Renderer';
import { schema as imageGallerySchema, blockConfig as imageGalleryBlocks } from './image_gallery/schema';
import ImageGalleryRenderer from './image_gallery/Renderer';
import { schema as beforeAfterSliderSchema, blockConfig as beforeAfterSliderBlocks } from './before_after_slider/schema';
import BeforeAfterSliderRenderer from './before_after_slider/Renderer';
import { schema as contactFormSchema, blockConfig as contactFormBlocks } from './contact_form/schema';
import ContactFormRenderer from './contact_form/Renderer';
import { schema as faqAccordionSchema, blockConfig as faqAccordionBlocks } from './faq_accordion/schema';
import FaqAccordionRenderer from './faq_accordion/Renderer';
import { schema as mapEmbedSchema, blockConfig as mapEmbedBlocks } from './map_embed/schema';
import MapEmbedRenderer from './map_embed/Renderer';
import { schema as dividerSpacerSchema } from './divider_spacer/schema';
import DividerSpacerRenderer from './divider_spacer/Renderer';

export const SECTION_DEFINITIONS = {
  header: { schema: headerSchema, Renderer: HeaderRenderer },
  footer: { schema: footerSchema, Renderer: FooterRenderer },
  hero_banner: { schema: heroBannerSchema, blockConfig: heroBannerBlocks, Renderer: HeroBannerRenderer },
  announcement_bar: { schema: announcementBarSchema, blockConfig: announcementBarBlocks, Renderer: AnnouncementBarRenderer },
  video_banner: { schema: videoBannerSchema, blockConfig: videoBannerBlocks, Renderer: VideoBannerRenderer },
  featured_products: { schema: featuredProductsSchema, blockConfig: featuredProductsBlocks, Renderer: FeaturedProductsRenderer },
  collection_list: { schema: collectionListSchema, blockConfig: collectionListBlocks, Renderer: CollectionListRenderer },
  product_carousel: { schema: productCarouselSchema, blockConfig: productCarouselBlocks, Renderer: ProductCarouselRenderer },
  product_spotlight: { schema: productSpotlightSchema, blockConfig: productSpotlightBlocks, Renderer: ProductSpotlightRenderer },
  image_with_text: { schema: imageWithTextSchema, blockConfig: imageWithTextBlocks, Renderer: ImageWithTextRenderer },
  rich_text: { schema: richTextSchema, blockConfig: richTextBlocks, Renderer: RichTextRenderer },
  brand_values: { schema: brandValuesSchema, blockConfig: brandValuesBlocks, Renderer: BrandValuesRenderer },
  team_about: { schema: teamAboutSchema, blockConfig: teamAboutBlocks, Renderer: TeamAboutRenderer },
  testimonials: { schema: testimonialsSchema, blockConfig: testimonialsBlocks, Renderer: TestimonialsRenderer },
  star_rating_bar: { schema: starRatingBarSchema, blockConfig: starRatingBarBlocks, Renderer: StarRatingBarRenderer },
  press_logos: { schema: pressLogosSchema, blockConfig: pressLogosBlocks, Renderer: PressLogosRenderer },
  newsletter_signup: { schema: newsletterSignupSchema, blockConfig: newsletterSignupBlocks, Renderer: NewsletterSignupRenderer },
  countdown_timer: { schema: countdownTimerSchema, blockConfig: countdownTimerBlocks, Renderer: CountdownTimerRenderer },
  promotional_banner: { schema: promotionalBannerSchema, blockConfig: promotionalBannerBlocks, Renderer: PromotionalBannerRenderer },
  image_gallery: { schema: imageGallerySchema, blockConfig: imageGalleryBlocks, Renderer: ImageGalleryRenderer },
  before_after_slider: { schema: beforeAfterSliderSchema, blockConfig: beforeAfterSliderBlocks, Renderer: BeforeAfterSliderRenderer },
  contact_form: { schema: contactFormSchema, blockConfig: contactFormBlocks, Renderer: ContactFormRenderer },
  faq_accordion: { schema: faqAccordionSchema, blockConfig: faqAccordionBlocks, Renderer: FaqAccordionRenderer },
  map_embed: { schema: mapEmbedSchema, blockConfig: mapEmbedBlocks, Renderer: MapEmbedRenderer },
  divider_spacer: { schema: dividerSpacerSchema, Renderer: DividerSpacerRenderer },
};

export function schemaForType(type) {
  return SECTION_DEFINITIONS[type]?.schema ?? {};
}
