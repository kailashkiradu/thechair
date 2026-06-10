import os
import re

from restructure import CLASS_MAPPINGS, JAVA_SRC_DIR

def fix_missing_imports():
    # Find all java files
    java_files = []
    for root, dirs, files in os.walk(JAVA_SRC_DIR):
        for file in files:
            if file.endswith(".java"):
                java_files.append(os.path.join(root, file))

    print(f"Scanning {len(java_files)} files for missing imports...")

    for file_path in java_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find package
        pkg_match = re.search(r"package\s+([A-Za-z0-9_\.]+);", content)
        if not pkg_match:
            continue
        file_pkg = pkg_match.group(1)

        # Find existing imports
        existing_imports = set(re.findall(r"import\s+([A-Za-z0-9_\.\*]+);", content))

        # Determine which classes are referenced as words
        missing_imports = []
        for cls_name, cls_pkg in CLASS_MAPPINGS.items():
            # If the class name is used as a word in the file
            # and is not in the same package
            # and is not already imported
            if cls_pkg != file_pkg:
                if re.search(r"\b" + cls_name + r"\b", content):
                    import_statement = f"{cls_pkg}.{cls_name}"
                    if import_statement not in existing_imports:
                        missing_imports.append(import_statement)

        if missing_imports:
            # Insert imports after package statement
            print(f"Adding to {os.path.basename(file_path)}: {missing_imports}")
            
            # Find where package ends
            pkg_end = pkg_match.end()
            
            # Form import strings
            import_lines = "\n" + "\n".join(f"import {imp};" for imp in sorted(missing_imports))
            
            new_content = content[:pkg_end] + import_lines + content[pkg_end:]
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)

if __name__ == "__main__":
    fix_missing_imports()
    print("Missing imports fix complete!")
