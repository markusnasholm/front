const SCRIPT_EMPTY = `// Define your global variables here
// var example = 0;

function onItemCaptured(data) {
  // Your code goes here
}

function onPacketCaptured(info) {
  // Your code goes here
}

function onItemQueried(data) {
  // Your code goes here
}

// Schedule your jobs here
// jobs.schedule("example-job", "*/5 * * * * *", exampleJob)
`;

const SCRIPT_WEBHOOK = `// Call a Webhook For Each Health Check

function onItemCaptured(data) {
  console.log(data.request.path);
  if (data.request.path === "/health")
    vendor.webhook("POST", env.WEBHOOK_URL, data);
}
`;

const SCRIPT_SLACK = `// Report To a Slack Channel If HTTP Status Code is 500 Example

function onItemCaptured(data) {
  // Check if it's an HTTP request and the response status is 500
  if (data.protocol.name === "http" && data.response.status === 500) {
    var files = {};

    // Get the path of the PCAP file that this stream belongs to
    var pcapPath = pcap.path(data.stream);
    files[data.stream + ".pcap"] = pcapPath;

    // Dump the \`data\` argument into a temporary JSON file
    var dataPath = file.temp("data", "", "json");
    file.write(dataPath, JSON.stringify(data, null, 2));
    files["data.json"] = dataPath;

    // Send a detailed Slack message with 2 attached files
    vendor.slackBot(
      SLACK_AUTH_TOKEN,
      SLACK_CHANNEL_ID,
      "Server-side Error in Kubernetes Cluster",                                    // Pretext
      "An HTTP request resulted with " + data.response.status + " status code:",    // Text
      "#ff0000",                                                                    // Color
      {
        "Service": data.dst.name,
        "Namespace": data.namespace,
        "Node": data.node.name,
        "HTTP method": data.request.method,
        "HTTP path": data.request.path
      },
      files
    );

    // Delete the temporary file
    file.delete(dataPath);
  }
}
`;

const SCRIPT_LOG_TOTAL_CAPTURED_PACKET_KB_PER_MIN = `// Log Total Captured Packet and KB Every Minute

var packetCount = 0;
var totalKB = 0;

function onPacketCaptured(info) {
  packetCount++;
  totalKB += info.length / 1000;
}

function logPacketCountTotalBytes() {
  console.log("Captured packet count per minute:", packetCount);
  packetCount = 0;
  console.log("Total KB captured per minute:", totalKB);
  totalKB = 0;
}

jobs.schedule("log-packet-count-total-bytes", "0 */1 * * * *", logPacketCountTotalBytes);
`;

const SCRIPT_MONITORING_PASS_HTTP = `// Monitoring: Fail HTTP Status Code is 500, Pass Anything Else

function onItemQueried(data) {
  if (data.protocol.name === "http" && data.response.status === 500)
    return test.pass(data);
  else
    return test.fail(data);
}
`;

const SCRIPT_PRINT_ENV = `// Print Environment Variables

console.log(JSON.stringify(env));
`

const SCRIPT_INFLUXDB = `// Aggregate the HTTP Status Codes and Push Them to InfluxDB Every Minute

var statusCodes = {};

function onItemCaptured(data) {
  if (data.protocol.name !== "http") return;

  if (statusCodes.hasOwnProperty(data.response.status)) {
    statusCodes[data.response.status]++;
  } else {
    statusCodes[data.response.status] = 1;
  }
}

function pushStatusCodesToInfluxDB() {
  console.log("Status Codes:", JSON.stringify(statusCodes));

  vendor.influxdb(
    env.INFLUXDB_URL,
    env.INFLUXDB_TOKEN,
    env.INFLUXDB_ORGANIZATION,
    env.INFLUXDB_BUCKET,
    "Status Codes",               // Measurement
    statusCodes                   // Payload
  );

  statusCodes = {};
}

jobs.schedule("push-status-codes-to-influxdb", "0 */1 * * * *", pushStatusCodesToInfluxDB);
`

const SCRIPT_ELASTIC = `// Aggregate the HTTP Status Codes and Push Them to Elastic Cloud Every Minute

var statusCodes = {};

function onItemCaptured(data) {
  if (data.protocol.name !== "http") return;

  if (statusCodes.hasOwnProperty(data.response.status)) {
    statusCodes[data.response.status]++;
  } else {
    statusCodes[data.response.status] = 1;
  }
}

function pushStatusCodesToElasticsearch() {
  console.log("Status Codes:", JSON.stringify(statusCodes));

  vendor.elastic(
    "",                     // URL is ignored for Elastic Cloud
    env.ELASTIC_INDEX,
    statusCodes,            // Payload
    "",                     // Username is ignored for Elastic Cloud
    "",                     // Password is ignored for Elastic Cloud
    env.ELASTIC_CLOUD_ID,
    env.ELASTIC_API_KEY
  );

  statusCodes = {};
}

jobs.schedule("push-status-codes-to-elastic", "0 */1 * * * *", pushStatusCodesToElasticsearch);
`

const SCRIPT_S3 = `// Upload PCAP File of a Stream to an AWS S3 Bucket If HTTP Status Code is 500

function onItemCaptured(data) {
  if (data.protocol.name === "http" && data.response.status === 500) {
    // Get PCAP file path of the TCP/UDP stream
    var pcapPath = pcap.path(data.stream);

    // Dump the name resolution history into a file
    var nameResolutionHistory = pcap.nameResolutionHistory();
    var nameResolutionHistoryPath = "name_resolution_history.json";
    file.write(
      nameResolutionHistoryPath,
      JSON.stringify(nameResolutionHistory)
    );

    // Upload PCAP file to S3 bucket
    var location = vendor.s3.put(
      env.AWS_REGION,
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
      env.S3_BUCKET,
      pcapPath
    );
    console.log("Uploaded PCAP to S3:", pcapPath, "URL:", location);

    // Upload name resolution history to S3 bucket
    location = vendor.s3.put(
      env.AWS_REGION,
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
      env.S3_BUCKET,
      nameResolutionHistoryPath
    );
    console.log("Uploaded name resolution history to S3:", nameResolutionHistoryPath, "URL:", location);

    // Clean up the temporary files
    file.delete(nameResolutionHistoryPath);
  }
}
`;

const SCRIPT_S3_SNAPSHOT = `// Upload a PCAP Snapshot to an AWS S3 Bucket If HTTP Status Code is 500

function onItemCaptured(data) {
  if (data.protocol.name === "http" && data.response.status === 500) {
    // Create a temporary directory
    var dir = file.mkdirTemp("snapshot");

    // Create the PCAP snapshot
    var snapshot = pcap.snapshot();

    // Move the snapshot into the temporary directory
    file.move(snapshot, dir);

    // Dump the name resolution history into a file
    var nameResolutionHistory = pcap.nameResolutionHistory();
    file.write(
      dir + "/name_resolution_history.json",
      JSON.stringify(nameResolutionHistory)
    );

    // Create an archive from the directory
    var tarFile = file.tar(dir);

    // Upload TAR file to S3 bucket
    var location = vendor.s3.put(
      env.AWS_REGION,
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
      env.S3_BUCKET,
      tarFile
    );
    console.log("Uploaded PCAP snapshot to S3:", tarFile, "URL:", location);

    /*
    The TAR file kubeshark_<TIMESTAMP>.tar.gz can now be downloaded from the Amazon S3 bucket.
    Use \`kubeshark tap --pcap <TAR_FILE_PATH>\` command to capture from the PCAP snapshot (.tar.gz file)
    */

    // Clean up the temporary files and directories
    file.delete(dir);
    file.delete(tarFile);
  }
}
`;

const SCRIPT_ERROR_HANDLING = `// Error Handling

function onItemCaptured(data) {
  try {
    // Invalid KFL query throws an error
    if (kfl.match("htt ??? a : p", data)) {
      console.log(true);
    } else {
      console.log(false);
    }
  } catch (error) {
    // Should print \`Caught an error! Error: 1:5: unexpected token "?"\`
    console.log("Caught an error!", error);
  }
}
`

const SCRIPT_CHATGPT = `// Use ChatGPT to Detect Unprocessable HTTP Requests

function onItemCaptured(data) {
  if (data.protocol.name == "http") {
    // Extract only the fields that we are interested in to not confuse ChatGPT
    var fieldsOfInterest = { request: data.request, response: data.response }

    var payload = JSON.stringify(fieldsOfInterest);
    var prompt = "Is the HTTP request unprocessable by the HTTP server in this HTTP request-response pair? " + payload;

    var response = chatgpt.prompt(
      env.OPENAI_API_KEY,
      prompt.slice(0, 3000)   // Limit the prompt size to not exceed 4097 tokens limit
    );
    // console.log("Actual HTTP status:", data.response.status, "ChatGPT:", response);

    var score = chatgpt.sentiment(response);
    if (score.pos > 0) {
      console.log("ALERT! ChatGPT is detected an unprocessable request:", response, "Payload:", payload);
    }
  }
}
`

const EXAMPLE_SCRIPTS = [
  SCRIPT_EMPTY,
  SCRIPT_PRINT_ENV,
  SCRIPT_ERROR_HANDLING,
  SCRIPT_SLACK,
  SCRIPT_WEBHOOK,
  SCRIPT_LOG_TOTAL_CAPTURED_PACKET_KB_PER_MIN,
  SCRIPT_MONITORING_PASS_HTTP,
  SCRIPT_INFLUXDB,
  SCRIPT_ELASTIC,
  SCRIPT_S3,
  SCRIPT_S3_SNAPSHOT,
  SCRIPT_CHATGPT,
]

const EXAMPLE_SCRIPT_TITLES = [
  "Empty",
  "Print Environment Variables",
  "Error Handling",
  "Report To a Slack Channel If HTTP Status Code is 500",
  "Call a Webhook For Each Health Check",
  "Log Total Captured Packet and KB Every Minute",
  "Monitoring: Fail HTTP Status Code is 500, Pass Anything Else",
  "Aggregate the HTTP Status Codes and Push Them to InfluxDB Every Minute",
  "Aggregate the HTTP Status Codes and Push Them to Elastic Cloud Every Minute",
  "Upload PCAP File of a Stream to an AWS S3 Bucket If HTTP Status Code is 500",
  "Upload a PCAP Snapshot to an AWS S3 Bucket If HTTP Status Code is 500",
  "Use ChatGPT to Detect Unprocessable HTTP Requests",
]

const DEFAULT_TITLE = "New Script"
const DEFAULT_SCRIPT = SCRIPT_EMPTY

export {
  SCRIPT_EMPTY,
  SCRIPT_PRINT_ENV,
  SCRIPT_ERROR_HANDLING,
  SCRIPT_SLACK,
  SCRIPT_WEBHOOK,
  SCRIPT_LOG_TOTAL_CAPTURED_PACKET_KB_PER_MIN,
  SCRIPT_MONITORING_PASS_HTTP,
  SCRIPT_INFLUXDB,
  SCRIPT_ELASTIC,
  SCRIPT_S3,
  SCRIPT_S3_SNAPSHOT,
  SCRIPT_CHATGPT,
  EXAMPLE_SCRIPTS,
  EXAMPLE_SCRIPT_TITLES,
  DEFAULT_TITLE,
  DEFAULT_SCRIPT,
}
