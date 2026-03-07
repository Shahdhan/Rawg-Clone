<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(),[
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        if($validator->fails()){
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function updatePicture(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(),[
            'profile_picture' => 'required|string',
        ]);

        if ($validator->fails()){
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $base64 = $request->profile_picture;
        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64));
        $filename = 'profile_pictures/' . $user->id . '_' . time() . '.jpg';
        \Storage::disk('public')->put($filename,$imageData);
        $user->profile_picture = asset('storage/' . $filename);
        $user->save();
        

        return response()->json([
            'message' => 'Profile picture updated successfully',
            'user' => $user
        ]);
    }

    public function getUserReviews($userId)
    {
        $reviews = \App\Models\Review::with('game', $userId)
            ->orderBy('created_at', "desc")
            ->get();

            return response()->json($reviews);
    }
}
