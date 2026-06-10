"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileSchema, ChangePasswordSchema } from "@/lib/schemas";
import { updateProfile, changePassword } from "@/lib/actions";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { User, Lock, Bell } from "lucide-react";

interface SettingsFormProps {
  initialUser: {
    name: string | null;
    email: string;
  };
}

export default function SettingsForm({ initialUser }: SettingsFormProps) {
  // Form 1: Profile
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: initialUser.name || "",
      email: initialUser.email,
    },
  });

  const onProfileSubmit = async (data: any) => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    const res = await updateProfile(data);

    setProfileLoading(false);
    if (res.error) {
      setProfileError(res.error);
    } else {
      setProfileSuccess(res.success || "Profile updated!");
    }
  };

  // Form 2: Password
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPassSubmit = async (data: any) => {
    setPassLoading(true);
    setPassError(null);
    setPassSuccess(null);

    const res = await changePassword(data);

    setPassLoading(false);
    if (res.error) {
      setPassError(res.error);
    } else {
      setPassSuccess(res.success || "Password updated!");
      resetPass();
    }
  };

  // Form 3: Notification mock
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);

  const handleNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifLoading(true);
    setNotifSuccess(null);
    setTimeout(() => {
      setNotifLoading(false);
      setNotifSuccess("Notification preferences updated!");
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Profile Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center space-x-3 pb-4 border-b border-gray-50">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Profile Details</CardTitle>
            <p className="text-xs text-gray-400">Update your account name and email address.</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
            {profileError && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3 rounded border border-emerald-200">
                {profileSuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
              <input
                type="text"
                disabled={profileLoading}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                {...registerProfile("name")}
              />
              {profileErrors.name && (
                <p className="text-red-500 text-xs mt-0.5">{profileErrors.name.message as string}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
              <input
                type="email"
                disabled={profileLoading}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                {...registerProfile("email")}
              />
              {profileErrors.email && (
                <p className="text-red-500 text-xs mt-0.5">{profileErrors.email.message as string}</p>
              )}
            </div>

            <Button type="submit" disabled={profileLoading} className="font-bold">
              {profileLoading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center space-x-3 pb-4 border-b border-gray-50">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Change Password</CardTitle>
            <p className="text-xs text-gray-400">Change your login password security.</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePassSubmit(onPassSubmit)} className="space-y-4 max-w-md">
            {passError && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded border border-red-200">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3 rounded border border-emerald-200">
                {passSuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                disabled={passLoading}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                {...registerPass("currentPassword")}
              />
              {passErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-0.5">{passErrors.currentPassword.message as string}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                disabled={passLoading}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                {...registerPass("newPassword")}
              />
              {passErrors.newPassword && (
                <p className="text-red-500 text-xs mt-0.5">{passErrors.newPassword.message as string}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                disabled={passLoading}
                className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                {...registerPass("confirmPassword")}
              />
              {passErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-0.5">{passErrors.confirmPassword.message as string}</p>
              )}
            </div>

            <Button type="submit" disabled={passLoading} className="font-bold">
              {passLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="flex flex-row items-center space-x-3 pb-4 border-b border-gray-50">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Notification Preferences</CardTitle>
            <p className="text-xs text-gray-400">Configure how you receive report updates.</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleNotifSubmit} className="space-y-6 max-w-md">
            {notifSuccess && (
              <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3 rounded border border-emerald-200">
                {notifSuccess}
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5"
                />
                <div>
                  <span className="text-sm font-semibold text-charcoal block">Email Audit Reports</span>
                  <span className="text-xs text-gray-500">Receive a PDF copy of completed reports in your inbox.</span>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5"
                />
                <div>
                  <span className="text-sm font-semibold text-charcoal block">Status Change Alerts</span>
                  <span className="text-xs text-gray-500">Get notified when request progresses from Submitted to In Progress.</span>
                </div>
              </label>
            </div>

            <Button type="submit" disabled={notifLoading} className="font-bold">
              {notifLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
