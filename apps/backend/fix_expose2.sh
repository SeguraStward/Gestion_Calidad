#!/bin/bash
TARGET="src/modules/academic-loads/dtos/academic-load.dto.ts"
# Add Expose to properties that don't have it
sed -i -e '/@ApiProperty/a \  @Expose()' "$TARGET"
