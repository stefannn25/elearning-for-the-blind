<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");


$apiKey = "AIzaSyD5_4EXAmIyYmhA07WRg7RauWfYBA5aE9k";


$input = json_decode(file_get_contents("php://input"), true);
$userPrompt = $input["prompt"] ?? "";


if (!$userPrompt) {
    echo json_encode(["error" => "No prompt provided"]);
    exit;
}

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

// Build request payload
$payload = [
    "contents" => [
        [
            "role" => "user",
            "parts" => [["text" => $userPrompt]]
        ]
    ]
];

// Send request to Gemini API
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;
}
curl_close($ch);

// Return Gemini response
echo $response;
