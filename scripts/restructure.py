import os
import re
import shutil

CLASS_MAPPINGS = {
    # Config
    "DataInitializer": "com.thechair.common.config",
    "SecurityConfig": "com.thechair.security.config",
    # Controllers
    "AdminController": "com.thechair.admin.controller",
    "AuthController": "com.thechair.auth.controller",
    "BookingController": "com.thechair.bookings.controller",
    "OwnerController": "com.thechair.salons.controller",
    "SalonController": "com.thechair.salons.controller",
    # DTO Requests
    "BookingRequest": "com.thechair.bookings.dto",
    "LoginRequest": "com.thechair.auth.dto",
    "OfferingRequest": "com.thechair.services.dto",
    "RegisterRequest": "com.thechair.auth.dto",
    "SalonRequest": "com.thechair.salons.dto",
    "SlotGenerateRequest": "com.thechair.bookings.dto",
    # DTO Responses
    "AdminStatsResponse": "com.thechair.admin.dto",
    "ApiResponse": "com.thechair.common.dto",
    "AuthResponse": "com.thechair.auth.dto",
    "BookingResponse": "com.thechair.bookings.dto",
    "OfferingResponse": "com.thechair.services.dto",
    "SalonResponse": "com.thechair.salons.dto",
    "SlotResponse": "com.thechair.bookings.dto",
    "UserResponse": "com.thechair.users.dto",
    # Entities
    "Booking": "com.thechair.bookings.entity",
    "Salon": "com.thechair.salons.entity",
    "SalonOffering": "com.thechair.services.entity",
    "TimeSlot": "com.thechair.bookings.entity",
    "User": "com.thechair.users.entity",
    # Enums
    "BookingStatus": "com.thechair.bookings.entity",
    "PaymentStatus": "com.thechair.bookings.entity",
    "SalonStatus": "com.thechair.salons.entity",
    "UserRole": "com.thechair.users.entity",
    # Exceptions
    "BadRequestException": "com.thechair.common.exception",
    "ConflictException": "com.thechair.common.exception",
    "GlobalExceptionHandler": "com.thechair.common.exception",
    "ResourceNotFoundException": "com.thechair.common.exception",
    # Repositories
    "BookingRepository": "com.thechair.bookings.repository",
    "SalonOfferingRepository": "com.thechair.services.repository",
    "SalonRepository": "com.thechair.salons.repository",
    "TimeSlotRepository": "com.thechair.bookings.repository",
    "UserRepository": "com.thechair.users.repository",
    # Security
    "JwtFilter": "com.thechair.security.filter",
    "JwtUtil": "com.thechair.security.util",
    "UserDetailsServiceImpl": "com.thechair.security.service",
    # Services
    "AdminService": "com.thechair.admin.service",
    "AuthService": "com.thechair.auth.service",
    "BookingService": "com.thechair.bookings.service",
    "OwnerService": "com.thechair.salons.service",
    "SalonService": "com.thechair.salons.service"
}

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
JAVA_SRC_DIR = os.path.join(BASE_DIR, "backend", "src", "main", "java")

def get_class_name(file_path):
    return os.path.splitext(os.path.basename(file_path))[0]

def move_files():
    # Find all java files
    java_files = []
    for root, dirs, files in os.walk(JAVA_SRC_DIR):
        for file in files:
            if file.endswith(".java") and file != "ThechairApplication.java":
                java_files.append(os.path.join(root, file))

    print(f"Found {len(java_files)} java files to process.")

    # Move files and update packages
    moved_files = []
    for file_path in java_files:
        class_name = get_class_name(file_path)
        if class_name not in CLASS_MAPPINGS:
            print(f"Warning: No mapping for {class_name}, leaving in place.")
            continue

        new_pkg = CLASS_MAPPINGS[class_name]
        new_dir = os.path.join(JAVA_SRC_DIR, *new_pkg.split("."))
        os.makedirs(new_dir, exist_ok=True)
        new_file_path = os.path.join(new_dir, f"{class_name}.java")

        # Read file
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Update package declaration
        content = re.sub(r"package com\.thechair\.[a-z\.]+;", f"package {new_pkg};", content)

        # Write to new destination
        with open(new_file_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"Moved {class_name} to {new_file_path}")
        moved_files.append((file_path, new_file_path))

    # Remove old files (after verifying they are copied)
    for old_path, new_path in moved_files:
        if old_path != new_path and os.path.exists(new_path):
            os.remove(old_path)

    # Clean up empty folders under JAVA_SRC_DIR/com/thechair
    clean_empty_dirs(os.path.join(JAVA_SRC_DIR, "com", "thechair"))

def clean_empty_dirs(path):
    if not os.path.isdir(path):
        return
    for root, dirs, files in os.walk(path, topdown=False):
        for dir in dirs:
            dir_path = os.path.join(root, dir)
            if not os.listdir(dir_path):
                os.rmdir(dir_path)
                print(f"Removed empty directory: {dir_path}")

def fix_imports():
    # Find all java files in their new locations
    java_files = []
    for root, dirs, files in os.walk(JAVA_SRC_DIR):
        for file in files:
            if file.endswith(".java"):
                java_files.append(os.path.join(root, file))

    for file_path in java_files:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        new_lines = []
        in_imports = False
        import_block_end_idx = -1

        for i, line in enumerate(lines):
            # Check if we are in imports block
            if line.strip().startswith("import "):
                in_imports = True
                # Match pattern like: import com.thechair.entity.User;
                # Or import com.thechair.entity.*;
                match_star = re.match(r"import com\.thechair\.[a-z0-9\._]+\.\*;", line.strip())
                match_single = re.match(r"import com\.thechair\.[a-z0-9\._]+\.([A-Za-z0-9]+);", line.strip())

                if match_star:
                    # Replace star import with explicit imports
                    star_pkg = match_star.group(0)
                    content_str = "".join(lines)
                    added_any = False
                    for cls, pkg in CLASS_MAPPINGS.items():
                        # If class is used in content and belongs to the original entity/dto/controller etc package
                        # We inject the correct new import
                        if cls in content_str and f"import {pkg}.{cls};" not in [l.strip() for l in new_lines]:
                            # Verify if the class was in the wildcard's package (roughly)
                            # e.g., if wildcard was com.thechair.entity.*, and cls is Booking, new package is com.thechair.bookings.entity
                            # The script matches if "entity" is in both
                            wildcard_part = re.search(r"com\.thechair\.([a-z\._]+)\.\*", line).group(1)
                            # Let's see if wildcard_part is present in old structure
                            # A simple heuristic: if it was entity, and class is an entity
                            if (wildcard_part == "entity" and pkg.endswith(".entity")) or \
                               (wildcard_part == "enums" and pkg.endswith(".entity")) or \
                               (wildcard_part == "repository" and pkg.endswith(".repository")) or \
                               (wildcard_part == "dto.request" and pkg.endswith(".dto")) or \
                               (wildcard_part == "dto.response" and pkg.endswith(".dto")):
                                new_lines.append(f"import {pkg}.{cls};\n")
                                added_any = True
                    if not added_any:
                        # Keep it just in case
                        new_lines.append(line)
                elif match_single:
                    cls_name = match_single.group(1)
                    if cls_name in CLASS_MAPPINGS:
                        new_lines.append(f"import {CLASS_MAPPINGS[cls_name]}.{cls_name};\n")
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)

        # Write fixed file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write("".join(new_lines))
        
        print(f"Fixed imports in {file_path}")

if __name__ == "__main__":
    print("Starting restructuring...")
    move_files()
    fix_imports()
    print("Restructuring completed successfully!")
