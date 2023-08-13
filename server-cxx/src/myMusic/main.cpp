#include <iostream>
#include <string>

#include "test/test.h"

using std::cout;
using std::cin;
using std::endl;
using std::string;


int main(int argc, char** argv)
{
    cout << "build time: " << __DATE__ << " | " << __TIME__ << endl;
    int num;
    cout << "<< input a number to stop" << endl << ">>>";
    cin >> num;

    return 0;
}

