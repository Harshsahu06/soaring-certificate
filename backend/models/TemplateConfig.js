import mongoose from 'mongoose';

const TemplateConfigSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['pdf', 'image'], default: 'pdf' },
    fieldConfigs: { type: Object, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.TemplateConfig || mongoose.model('TemplateConfig', TemplateConfigSchema);
