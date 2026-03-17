import re

# Read file
with open('src/app/(app)/onboarding/page.tsx', 'r') as f:
    content = f.read()

# Fix 1: Remove dynamic resolver from useForm
content = re.sub(
    r'const form = useForm<any>\(\{\s*resolver: zodResolver\([\s\S]*?\),\s*defaultValues:[\s\S]*?,\s*mode: "onChange",\s*\}\);',
    'const form = useForm<any>({\n    mode: "onChange",\n  });',
    content,
    count=1
)

# Write back
with open('src/app/(app)/onboarding/page.tsx', 'w') as f:
    f.write(content)

print('Fixed onboarding.tsx')
