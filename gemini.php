<?php
//  proxy ni gemini api

header("Content-Type: application/json");

$API_KEY = "AIzaSyD5_4EXAmIyYmhA07WRg7RauWfYBA5aE9k"; 
$endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $API_KEY;

// Get JSON input from frontend
$input = json_decode(file_get_contents("php://input"), true);

$prompt = $input["prompt"] ?? "Hello!";
$data = [
    "contents" => [
        [
            "role" => "user",
            "parts" => [
                [ "text" => $prompt ]
            ]
        ]
    ]
];

// cURL request to Gemini
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;

}

if (isset($input['nlp_analysis'])) {
    $text = $input['text'] ?? "";

    $prompt = "Analyze the following document using NLP techniques. 
    Return your response as structured JSON with these fields:
    - key_phrases: list of important keywords or phrases
    - named_entities: list of people, organizations, or places
    - sentiment: overall tone (positive, neutral, or negative)
    - summary: concise abstract of main ideas
    - topics: list of high-level subjects
    
    Document:
    $text";

    $data = [
        "contents" => [[
            "parts" => [["text" => $prompt]]
        ]]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
    exit;
}

curl_close($ch);

// Return Gemini’s response directly to frontend
echo $response;
