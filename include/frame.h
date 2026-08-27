#ifndef FRAME_H
#define FRAME_H

#ifdef __cplusplus
extern "C" {
#endif

int frame_init(const char *config_path, int verbose);
void frame_run(void);
void frame_cleanup(void);

#ifdef __cplusplus
}
#endif

#endif /* FRAME_H */
