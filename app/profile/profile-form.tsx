"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Profile {
  id?: string;
  userId?: string;
  username?: string;
  full_name?: string;
  website?: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  [key: string]: any;
}

interface ProfileFormProps {
  profile: Profile | null;
  onUpdate: (updatedProfile: Profile) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function ProfileForm({ profile, onUpdate, onDelete }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>(profile || {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.avatar_url || ""} alt={formData.username || "User"} />
              <AvatarFallback>{getInitials(formData.username)}</AvatarFallback>
            </Avatar>
            <div>
              <Input
                name="avatar_url"
                value={formData.avatar_url || ""}
                onChange={handleChange}
                placeholder="Avatar URL"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground mt-1">Enter URL for your profile picture</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                placeholder="Username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleChange}
                placeholder="Full Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <Input
              id="website"
              name="website"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="https://your-website.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(profile);
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.username || "User"} />
              <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{profile.username || "Anonymous"}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          {profile.full_name && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
              <p>{profile.full_name}</p>
            </div>
          )}

          {profile.website && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Website</h4>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}

          {profile.bio && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
              <p>{profile.bio}</p>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 