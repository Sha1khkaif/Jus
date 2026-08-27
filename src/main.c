#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <getopt.h>
#include "frame.h"

static void print_help(const char *prog) {
    printf("Usage: %s [options]\n", prog);
    puts("  -c, --config PATH    path to config file (default: ./jus.conf)");
    puts("  -v, --verbose        enable verbose logging");
    puts("  -h, --help           show this help and exit");
}

int main(int argc, char **argv) {
    const char *config_path = "./jus.conf";
    int verbose = 0;

    static struct option long_opts[] = {
        { "config",  required_argument, NULL, 'c' },
        { "verbose", no_argument,       NULL, 'v' },
        { "help",    no_argument,       NULL, 'h' },
        { NULL, 0, NULL, 0 }
    };

    int opt;
    while ((opt = getopt_long(argc, argv, "c:vh", long_opts, NULL)) != -1) {
        switch (opt) {
            case 'c':
                config_path = optarg;
                break;
            case 'v':
                verbose = 1;
                break;
            case 'h':
            default:
                print_help(argv[0]);
                return (opt == 'h') ? EXIT_SUCCESS : EXIT_FAILURE;
        }
    }

    if (!frame_init(config_path, verbose)) {
        fprintf(stderr, "frame_init failed\n");
        return EXIT_FAILURE;
    }

    frame_run();

    frame_cleanup();
    return EXIT_SUCCESS;
}
