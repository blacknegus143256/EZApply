<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class PsgcController extends Controller
{
    public function regions()
    {
        $response = Http::get('https://psgc.cloud/api/regions');
        return $response->json();
    }

    public function provinces($region)
    {
        $response = Http::get("https://psgc.cloud/api/regions/{$region}/provinces");
        return $response->json();
    }

    public function cities($province)
    {
        $response = Http::get("https://psgc.cloud/api/provinces/{$province}/cities-municipalities");
        return $response->json();
    }
    public function barangays($city)
    {
        $response = Http::get("https://psgc.cloud/api/cities-municipalities/{$city}/barangays");
        return $response->json();
    }
}
