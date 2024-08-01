const { get } = require("axios");
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

const rekognition = new AWS.Rekognition();
const translate = new AWS.Translate();

const getImageBuffer = async (imageUrl) => {
  const response = await get(imageUrl, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};

const detectImageLabels = async (buffer) => {
  const result = await rekognition
    .detectLabels({
      Image: {
        Bytes: buffer,
      },
    })
    .promise();

  const workingItems = result.Labels.filter(
    ({ Confidence }) => Confidence > 80
  );

  const names = workingItems.map(({ Name }) => Name).join(" and ");

  return {
    names,
    workingItems,
  };
};

const translateText = async (text) => {
  const params = {
    SourceLanguageCode: "en",
    TargetLanguageCode: "pt",
    Text: text,
  };

  const { TranslatedText } = await translate.translateText(params).promise();
  return TranslatedText.split(" e ");
};

const formatTextResults = (texts, workingItems) => {
  const finalText = [];
  for (const indexText in texts) {
    const nameInPortuguese = texts[indexText];
    const confidence = workingItems[indexText];

    finalText.push(
      `${confidence.Confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`
    );
  }

  return finalText.join("\n");
};

const main = async (event) => {
  try {
    const { imageUrl } = event.queryStringParameters;

    if (!imageUrl) {
      return {
        statusCode: 400,
        body: "An IMG URL is required",
      };
    }

    const buffer = await getImageBuffer(imageUrl);
    const { names, workingItems } = await detectImageLabels(buffer);
    const texts = await translateText(names);

    const result = formatTextResults(texts, workingItems);

    console.log(result);

    return {
      statusCode: 200,
      body: `A imagem tem\n${result}`,
    };
  } catch (err) {
    console.error(err.stack);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

exports.main = main;
