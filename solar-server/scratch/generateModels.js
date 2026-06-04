const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models/projects');

const templates = [
  {
    name: 'Technology',
    refField: 'subProjectTypeId',
    refModel: 'SubProjectType',
    fileName: 'Technology.js'
  },
  {
    name: 'PanelWatt',
    refField: 'technologyId',
    refModel: 'Technology',
    fileName: 'PanelWatt.js'
  },
  {
    name: 'SolarPanel',
    refField: 'panelWattId',
    refModel: 'PanelWatt',
    fileName: 'SolarPanel.js'
  },
  {
    name: 'Kilowatt',
    refField: 'solarPanelId',
    refModel: 'SolarPanel',
    fileName: 'Kilowatt.js'
  }
];

templates.forEach(t => {
  const content = `import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, '${t.name} name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        ${t.refField}: {
            type: mongoose.Schema.Types.ObjectId,
            ref: '${t.refModel}',
            required: false
        },
        status: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // allowing false for simplicity if auth middleware behaves differently
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export default mongoose.model('${t.name}', schema);
`;
  fs.writeFileSync(path.join(modelsDir, t.fileName), content);
  console.log('Created ' + t.fileName);
});
