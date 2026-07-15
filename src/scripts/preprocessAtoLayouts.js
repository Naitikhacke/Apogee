const fs = require('fs');
const path = require('path');

// --- Configuration ---
const DATA_DIR = path.join(process.cwd(), 'data');
const RAW_FILE_PATH = path.join(DATA_DIR, 'ato_app_layout_raw.json');
const CLEANED_FILE_PATH = path.join(DATA_DIR, 'ato_app_layout_cleaned.json');
const TOKEN_READY_PATH = path.join(DATA_DIR, 'ato_app_layout_token_ready.json');
const LOG_FILE_PATH = path.join(DATA_DIR, 'preprocessing_log.txt');

// --- Logger ---
function logInfo(message) {
  const logMsg = `[INFO] ${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(LOG_FILE_PATH, logMsg);
  console.log(logMsg.trim());
}

function logError(message) {
  const logMsg = `[ERROR] ${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(LOG_FILE_PATH, logMsg);
  console.error(logMsg.trim());
}

// --- 1. Load and Validate ---
function loadAndValidate() {
  logInfo(`Loading dataset from ${RAW_FILE_PATH}...`);
  if (!fs.existsSync(RAW_FILE_PATH)) {
    throw new Error('Raw dataset not found!');
  }

  const rawData = JSON.parse(fs.readFileSync(RAW_FILE_PATH, 'utf-8'));
  const validData = [];

  rawData.forEach((item, index) => {
    if (!item.id || !item.screen_name) {
      logError(`Missing ID or Screen Name at index ${index}. Skipping.`);
      return;
    }
    if (item.status === 'deprecated' || item.component_type === 'NULL') {
      logInfo(`Flagged and removed deprecated/malformed entry: ${item.id}`);
      return;
    }
    validData.push(item);
  });

  logInfo(`Validation complete. Retained ${validData.length} valid entries out of ${rawData.length}.`);
  return validData;
}

// --- 2 & 3. Analyze, Extract, and Clean ---
function preprocess(data) {
  logInfo('Starting feature extraction and cleaning...');
  
  return data.map((item) => {
    const label = (item.label || '').trim().toLowerCase();
    const content = (item.content_text || '').trim().toLowerCase();
    const a11y = (item.accessibility_label || '').trim().toLowerCase();

    let tokenizableText = `UI Component: ${item.component_type}. Label: "${label}".`;
    if (content) tokenizableText += ` Content: "${content}".`;
    if (a11y) tokenizableText += ` Accessibility: "${a11y}".`;
    if (item.is_required) tokenizableText += ` This field is required.`;

    return {
      feature_id: item.id,
      context: `Taxation Workflow - ${item.screen_name}`,
      tokenizable_text: tokenizableText,
      metadata: {
        screen: item.screen_name,
        type: item.component_type,
        is_interactive: ['button', 'input', 'link'].includes(item.component_type),
      }
    };
  });
}

// --- 4. Prepare Tokenization-Ready Datasets ---
function prepareForTokenization(features) {
  logInfo('Formatting data for Google Generative AI SDK ingestion...');
  
  const geminiTrainingFormat = features.map(f => ({
    messages: [
      { role: 'user', content: `Analyze the purpose of this UI element on the ${f.metadata.screen}. Component: ${f.metadata.type}` },
      { role: 'model', content: `This element is part of the ${f.context}. Details: ${f.tokenizable_text}` }
    ]
  }));

  fs.writeFileSync(CLEANED_FILE_PATH, JSON.stringify(features, null, 2));
  fs.writeFileSync(TOKEN_READY_PATH, JSON.stringify(geminiTrainingFormat, null, 2));

  logInfo(`Saved cleaned features to ${CLEANED_FILE_PATH}`);
  logInfo(`Saved token-ready dataset to ${TOKEN_READY_PATH}`);
  
  const interactiveCount = features.filter(f => f.metadata.is_interactive).length;
  console.log('\n--- Dataset Summary Report ---');
  console.log(`Total Valid Features: ${features.length}`);
  console.log(`Interactive Elements: ${interactiveCount}`);
  console.log(`Static Elements: ${features.length - interactiveCount}`);
  console.log('Sample Tokenizable String:');
  console.log(features[0].tokenizable_text);
  console.log('------------------------------\n');
}

// --- Execute Pipeline ---
function runPipeline() {
  if (fs.existsSync(LOG_FILE_PATH)) fs.unlinkSync(LOG_FILE_PATH);
  
  try {
    const rawData = loadAndValidate();
    const processed = preprocess(rawData);
    prepareForTokenization(processed);
    logInfo('Pipeline completed successfully.');
  } catch (error) {
    logError(`Pipeline failed: ${error}`);
  }
}

runPipeline();
