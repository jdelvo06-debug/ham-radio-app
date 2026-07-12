#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
android_dir="$project_root/android"

required_files=(
  "$android_dir/gradlew"
  "$android_dir/build.gradle"
  "$android_dir/app/build.gradle"
  "$android_dir/settings.gradle"
  "$android_dir/gradle/wrapper/gradle-wrapper.properties"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "$required_file" ]]; then
    echo "Android config check failed: missing ${required_file#"$project_root/"}." >&2
    exit 1
  fi
done

grep -q 'gradle-8\.14\.3-' "$android_dir/gradle/wrapper/gradle-wrapper.properties"
grep -q "com.android.tools.build:gradle:8.13.0" "$android_dir/build.gradle"
grep -q "include ':capgo-native-purchases'" "$android_dir/capacitor.settings.gradle"

echo "Android config check passed: Gradle 8.14.3, Android Gradle Plugin 8.13.0, native purchases included."

if ! java_output="$(java -version 2>&1)"; then
  echo "Android Gradle verification blocked: a working JDK 21 runtime is required." >&2
  echo "Install JDK 21, set JAVA_HOME, and rerun npm run verify:android." >&2
  echo "$java_output" >&2
  exit 2
fi

echo "$java_output"
cd "$android_dir"
./gradlew --version
./gradlew test lint --no-daemon
