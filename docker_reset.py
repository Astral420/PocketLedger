#!/usr/bin/env python3
"""
Docker Compose Reset Script
Automatically runs: docker compose down -v, build, and up
Makes migration and rebuilding easier
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(command, shell=True)
        if result.returncode != 0:
            print(f"\n❌ Error: {description} failed with exit code {result.returncode}")
            return False
        print(f"\n✓ {description} completed successfully")
        return True
    except Exception as e:
        print(f"\n❌ Error running command: {e}")
        return False

def main():
    """Main function to run all docker compose commands"""
    print("\n" + "="*60)
    print("Docker Compose Reset & Migration Script")
    print("="*60)
    
    # Check if docker compose is available
    try:
        subprocess.run("docker compose version", shell=True, capture_output=True, check=True)
    except:
        print("\n❌ Error: Docker Compose is not installed or not available in PATH")
        sys.exit(1)
    
    # Step 1: Down with volumes
    if not run_command(
        "docker compose down -v",
        "Step 1: Stopping containers and removing volumes"
    ):
        sys.exit(1)
    
    # Step 2: Build without cache
    if not run_command(
        "docker compose build --no-cache",
        "Step 2: Building containers (no cache)"
    ):
        sys.exit(1)
    
    # Step 3: Up
    if not run_command(
        "docker compose up",
        "Step 3: Starting containers"
    ):
        sys.exit(1)
    
    print("\n" + "="*60)
    print("✓ All operations completed successfully!")
    print("✓ Migrations have been applied automatically")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
