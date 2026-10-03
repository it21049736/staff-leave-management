package com.staffleave.dto;

/** Builds the public /media/... URL for a stored avatar path, or null if there isn't one. */
public class AvatarUrl {
    public static String from(String avatarPath) {
        return avatarPath == null ? null : "/media/" + avatarPath;
    }
}
