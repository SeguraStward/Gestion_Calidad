import os

target_files = [
    'test/src/modules/standards/standards.module.spec.ts',
    'test/src/modules/question-groups/question-groups.module.spec.ts'
]

for filepath in target_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove any accidentaly duplicated existsByName / existsByCode
    import re
    content = re.sub(r'existsByName:.*?\n', '', content)
    content = re.sub(r'existsByCode:.*?\n', '', content)

    # Insert it properly
    content = content.replace('count: jest.fn(),', 'count: jest.fn(),\n    existsByName: jest.fn().mockResolvedValue(false),\n    existsByCode: jest.fn().mockResolvedValue(false),')
    
    # Fix the schema validations that were failing
    if 'standards' in filepath:
        content = content.replace("name: 'Test Standards'", "name: 'Test Standards', code: 'STD01'")
    
    if 'question-groups' in filepath:
        # Update delete mock to handle the Prisma call correctly
        content = content.replace('.overrideProvider(PrismaService).useValue({})', '.overrideProvider(PrismaService).useValue({ question: { count: jest.fn().mockResolvedValue(0) } })')
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Files fixed")
