import TextField from './TextField';
import RichTextField from './RichTextField';
import ColorField from './ColorField';
import ImageField from './ImageField';
import SelectField from './SelectField';
import RangeField from './RangeField';
import BooleanField from './BooleanField';
import RepeaterField from './RepeaterField';

const FIELD_COMPONENTS = {
  text: TextField,
  textarea: TextField,
  richtext: RichTextField,
  color: ColorField,
  image: ImageField,
  select: SelectField,
  range: RangeField,
  boolean: BooleanField,
  repeater: RepeaterField,
};

/** Dispatches a schema field definition to its concrete input component. */
export default function SchemaField({ field, value, onChange, palette, mediaLibrary, onAddMedia, onOpenLibrary, activePage }) {
  const Component = FIELD_COMPONENTS[field.type];
  if (!Component) return null;
  return (
    <Component
      field={field}
      value={value}
      onChange={onChange}
      palette={palette}
      mediaLibrary={mediaLibrary}
      onAddMedia={onAddMedia}
      onOpenLibrary={onOpenLibrary}
      activePage={activePage}
    />
  );
}
