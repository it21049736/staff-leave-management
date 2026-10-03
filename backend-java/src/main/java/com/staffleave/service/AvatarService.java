package com.staffleave.service;

import com.staffleave.entity.User;
import com.staffleave.exception.BusinessRuleException;
import com.staffleave.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvatarService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_BYTES = 2L * 1024 * 1024; // 2MB, matches multipart config

    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public User upload(User user, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("No file was uploaded.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BusinessRuleException("Image must be 2MB or smaller.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessRuleException("Only JPEG, PNG, or WebP images are allowed.");
        }

        String extension = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        String filename = user.getId() + "_" + UUID.randomUUID() + extension;

        try {
            Path avatarsDir = Path.of(uploadDir, "avatars");
            Files.createDirectories(avatarsDir);
            Path target = avatarsDir.resolve(filename);
            file.transferTo(target);
        } catch (IOException e) {
            throw new BusinessRuleException("Could not save the uploaded image.");
        }

        deleteExistingFile(user);
        user.setAvatarPath("avatars/" + filename);
        return userRepository.save(user);
    }

    public User remove(User user) {
        deleteExistingFile(user);
        user.setAvatarPath(null);
        return userRepository.save(user);
    }

    private void deleteExistingFile(User user) {
        if (user.getAvatarPath() == null) return;
        try {
            Files.deleteIfExists(Path.of(uploadDir, user.getAvatarPath()));
        } catch (IOException ignored) {
            // best-effort cleanup; a stray orphaned file isn't worth failing the request over
        }
    }
}
