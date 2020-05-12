import re
re_regex = re.compile("""(
  (Re(\[\d+\])?:) | (\[ [^]]+ \])
\s*)+
""", re.I | re.VERBOSE)

def testRef():
    stringTest = "Re: [QUANTITY] Plea for pragmatism"
    print(re_regex.sub('', stringTest))

if __name__ == '__main__':
    testRef()